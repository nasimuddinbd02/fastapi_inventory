from typing import List, Dict, Any, Optional
from datetime import datetime,timezone
import asyncio
import logging
from app.agents import (
    BaseAgent, InventoryOptimizationAgent, DemandForecastingAgent,
    PricingOptimizationAgent, AgentDecision, AgentAction, AgentType, AgentPriority
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.exceptions import BusinessLogicError
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService
from app.viewmodels.product import ProductUpdateViewModel
from app.viewmodels.inventory import InventoryUpdateViewModel
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate
from app.dbAccess.inventory import create_inventory

logger = logging.getLogger("app.services.agent_service")

class AgentService:
    """Service for managing and coordinating AI agents"""

    def __init__(self):
        self.agents: Dict[AgentType, BaseAgent] = {}
        self.decision_history: List[AgentDecision] = []
        self.max_history_size = 1000

        # Initialize agents
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize all available agents"""
        self.agents[AgentType.INVENTORY_OPTIMIZATION] = InventoryOptimizationAgent()
        self.agents[AgentType.DEMAND_FORECASTING] = DemandForecastingAgent()
        self.agents[AgentType.PRICING_OPTIMIZATION] = PricingOptimizationAgent()

        logger.info(f"Initialized {len(self.agents)} AI agents")


    async def run_agent_analysis(self, agent_type: AgentType, context: Dict[str, Any]) -> AgentDecision:
        """Run analysis for a specific agent"""
        if agent_type not in self.agents:
            raise BusinessLogicError(f"Agent type {agent_type.value} not found")

        agent = self.agents[agent_type]
        logger.info(f"Running analysis for agent: {agent.name}")

        try:
            decision = await agent.analyze(context)
            self._add_to_history(decision)
            logger.info(f"Agent {agent.name} completed analysis with {len(decision.actions)} actions")
            return decision
        except Exception as e:
            logger.error(f"Error running agent {agent.name}: {str(e)}")
            raise BusinessLogicError(f"Agent analysis failed: {str(e)}")

    async def run_all_agents(self, context: Dict[str, Any]) -> List[AgentDecision]:
        """Run analysis for all available agents"""
        logger.info("Running analysis for all agents")

        tasks = []
        for agent_type, agent in self.agents.items():
            task = self.run_agent_analysis(agent_type, context)
            tasks.append(task)

        try:
            decisions = await asyncio.gather(*tasks, return_exceptions=True)

            # Filter out exceptions and log them
            valid_decisions = []
            for i, decision in enumerate(decisions):
                if isinstance(decision, Exception):
                    agent_type = list(self.agents.keys())[i]
                    logger.error(f"Agent {agent_type.value} failed: {str(decision)}")
                else:
                    valid_decisions.append(decision)

            logger.info(f"All agents completed analysis. {len(valid_decisions)} successful, {len(decisions) - len(valid_decisions)} failed")
            return valid_decisions
        except Exception as e:
            logger.error(f"Error running all agents: {str(e)}")
            raise BusinessLogicError(f"Multi-agent analysis failed: {str(e)}")


    async def execute_agent_action(self, agent_type: AgentType, action: AgentAction, db: AsyncSession) -> Dict[str, Any]:
        """Execute a specific agent action"""
        if agent_type not in self.agents:
            raise BusinessLogicError(f"Agent type {agent_type.value} not found")

        agent = self.agents[agent_type]
        logger.info(f"Executing action for agent {agent.name}: {action.action_type}")
        
        execution_details = {}

        try:
            # Initialize services
            product_service = ProductService(db)
            inventory_service = InventoryService(db)

            if action.action_type == "update_stock_quantity":
                product_id = int(action.parameters.get("product_id"))
                quantity_change = float(action.parameters.get("quantity_change", 0))
                
                # Find inventory for product
                result = await db.execute(select(Inventory).where(Inventory.product_id == product_id))
                inventory_record = result.scalars().first()
                
                if inventory_record:
                    new_quantity = max(0, inventory_record.quantity + quantity_change)
                    update_vm = InventoryUpdateViewModel(stock_quantity=new_quantity)
                    await inventory_service.update_inventory(inventory_record.id, update_vm)
                    execution_details = {"inventory_id": inventory_record.id, "new_quantity": new_quantity}
                else:
                    # Create new inventory record if it doesn't exist
                    logger.info(f"Creating new inventory record for product {product_id}")
                    new_quantity = max(0, quantity_change) # Assuming start from 0
                    create_dto = InventoryCreate(
                        product_id=product_id,
                        quantity=new_quantity,
                        location="Main Warehouse"
                    )
                    new_inventory = await create_inventory(db, create_dto)
                    execution_details = {"inventory_id": new_inventory.id, "new_quantity": new_quantity, "status": "created"}

            elif action.action_type == "update_product_price":
                product_id = int(action.parameters.get("product_id"))
                new_price = float(action.parameters.get("new_price"))
                
                update_vm = ProductUpdateViewModel(unit_price=new_price)
                await product_service.update_product(product_id, update_vm)
                execution_details = {"product_id": product_id, "new_price": new_price}
                
            # Log successful execution in agent
            result = await agent.execute_action(action)
            result["execution_details"] = execution_details
            
            logger.info(f"Action {action.action_type} executed successfully")
            return result
        except Exception as e:
            logger.error(f"Error executing action {action.action_type}: {str(e)}")
            raise BusinessLogicError(f"Action execution failed: {str(e)}")

    def get_agent_capabilities(self, agent_type: Optional[AgentType] = None) -> Dict[str, Any]:
        """Get capabilities of agents"""
        if agent_type:
            if agent_type not in self.agents:
                raise BusinessLogicError(f"Agent type {agent_type.value} not found")
            return {
                "agent_type": agent_type.value,
                "name": self.agents[agent_type].name,
                "capabilities": self.agents[agent_type].get_capabilities()
            }

        # Return all agents
        return {
            "agents": [
                {
                    "agent_type": agent_type.value,
                    "name": agent.name,
                    "capabilities": agent.get_capabilities()
                }
                for agent_type, agent in self.agents.items()
            ]
        }

    def get_decision_history(
        self,
        agent_type: Optional[AgentType] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[AgentDecision]:
        """Get decision history"""
        history = self.decision_history

        if agent_type:
            history = [d for d in history if d.agent_type == agent_type]

        # Sort by timestamp (newest first)
        history = sorted(history, key=lambda x: x.timestamp, reverse=True)

        start_idx = offset
        end_idx = offset + limit
        return history[start_idx:end_idx]

    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        return {
            "total_agents": len(self.agents),
            "active_agents": len(self.agents),  # All agents are always "active" in this implementation
            "total_decisions": len(self.decision_history),
            "agents": [
                {
                    "type": agent_type.value,
                    "name": agent.name,
                    "status": "active",
                    "last_decision": self._get_last_decision_time(agent_type)
                }
                for agent_type, agent in self.agents.items()
            ]
        }

    def _add_to_history(self, decision: AgentDecision):
        """Add decision to history with size limit"""
        self.decision_history.append(decision)

        # Maintain history size limit
        if len(self.decision_history) > self.max_history_size:
            # Remove oldest decisions
            self.decision_history = self.decision_history[-self.max_history_size:]

    def _get_last_decision_time(self, agent_type: AgentType) -> Optional[datetime]:
        """Get timestamp of last decision for an agent"""
        agent_decisions = [d for d in self.decision_history if d.agent_type == agent_type]
        if agent_decisions:
            return max(d.timestamp for d in agent_decisions)
        return None


    async def get_context_for_agents(self, db: Optional[AsyncSession]) -> Dict[str, Any]:
        """Gather context data needed by agents"""
        
        # Fallback to mock data if no DB session (e.g. testing)
        if not db:
            return {
                "timestamp":datetime.now(timezone.utc),
                "products": [
                    {
                        "id": 1,
                        "product_title": "Red Lipstick",
                        "stock_quantity": 25,
                        "reorder_point": 20,
                        "price": 15.99,
                        "cost": 8.00
                    },
                    {
                        "id": 2,
                        "product_title": "Blue Eyeshadow",
                        "stock_quantity": 45,
                        "reorder_point": 30,
                        "price": 12.50,
                        "cost": 6.00
                    }
                ],
                "sales_history": [],
                "competitor_prices": {}
            }

        # Fetch real data
        try:
            from app.dbAccess.product import get_products
            from app.dbAccess.inventory import get_inventories
            from app.dbAccess.dispatch import get_dispatch_orders

            # 1. Products
            products = await get_products(db, limit=50)
            
            # 2. Inventory (to match products)
            inventories = await get_inventories(db, limit=50)
            inventory_map = {inv.product_id: inv for inv in inventories}
            
            product_context = []
            for p in products:
                # Find matching inventory
                inv = inventory_map.get(p.id)
                current_stock = inv.quantity if inv else 0
                
                product_context.append({
                    "id": p.id,
                    "product_title": p.name,
                    "stock_quantity": float(current_stock),
                    "reorder_point": 10, # Default, as it might not be in DB model yet
                    "price": float(p.price) if p.price else 0,
                    "cost": 0 # Cost not in product model yet
                })

            # 3. Sales History (from Completed Dispatch Orders)
            orders, _ = await get_dispatch_orders(db, limit=50)
            sales_history = []
            for order in orders:
                if order.status.value == "completed": # Check status value string
                    for item in order.items:
                        sales_history.append({
                            "product_id": item.product_id,
                            "quantity": float(item.quantity),
                            "unit_price": float(item.unit_price),
                            "date": order.dispatch_date.isoformat()
                        })

            context = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "products": product_context,
                "sales_history": sales_history,
                "competitor_prices": {} # Placeholder as we don't scrape competitors yet
            }
            return context

        except Exception as e:
            logger.error(f"Error fetching DB context for agents: {e}")
            raise BusinessLogicError(f"Failed to gather agent context: {e}")
