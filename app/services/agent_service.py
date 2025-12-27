from typing import List, Dict, Any, Optional
from datetime import datetime,timezone
import asyncio
import logging
from app.agents import (
    BaseAgent, InventoryOptimizationAgent, DemandForecastingAgent,
    PricingOptimizationAgent, AgentDecision, AgentAction, AgentType, AgentPriority
)
from app.exceptions import BusinessLogicError

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

    async def execute_agent_action(self, agent_type: AgentType, action: AgentAction) -> Dict[str, Any]:
        """Execute a specific agent action"""
        if agent_type not in self.agents:
            raise BusinessLogicError(f"Agent type {agent_type.value} not found")

        agent = self.agents[agent_type]
        logger.info(f"Executing action for agent {agent.name}: {action.action_type}")

        try:
            result = await agent.execute_action(action)
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

    async def get_context_for_agents(self, db_session) -> Dict[str, Any]:
        """Gather context data needed by agents"""
        # This would typically query the database for relevant data
        # For now, return a sample context structure

        context = {
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
            "sales_history": [
                {"product_id": 1, "quantity": 5, "unit_price": 15.99, "date": "2025-12-20"},
                {"product_id": 1, "quantity": 3, "unit_price": 15.99, "date": "2025-12-21"},
                {"product_id": 2, "quantity": 8, "unit_price": 12.50, "date": "2025-12-20"},
                {"product_id": 2, "quantity": 6, "unit_price": 12.50, "date": "2025-12-21"}
            ],
            "competitor_prices": {
                1: {"average_price": 16.50, "min_price": 14.99, "max_price": 18.99},
                2: {"average_price": 11.99, "min_price": 10.99, "max_price": 13.99}
            }
        }

        return context