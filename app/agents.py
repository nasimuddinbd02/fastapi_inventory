from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging
import os
from typing import List, Dict, Any, Optional, TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("app.agents")

class AgentType(Enum):
    INVENTORY_OPTIMIZATION = "inventory_optimization"
    DEMAND_FORECASTING = "demand_forecasting"
    PRICING_OPTIMIZATION = "pricing_optimization"
    CUSTOMER_SERVICE = "customer_service"
    SUPPLIER_MANAGEMENT = "supplier_management"
    QUALITY_CONTROL = "quality_control"

class AgentPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class AgentAction:
    """Represents an action that an agent can take"""
    action_type: str
    description: str
    parameters: Dict[str, Any]
    priority: AgentPriority
    requires_approval: bool = False
    estimated_impact: Optional[str] = None

@dataclass
class AgentDecision:
    """Represents a decision made by an agent"""
    agent_type: AgentType
    decision: str
    confidence_score: float
    actions: List[AgentAction]
    reasoning: str
    timestamp: datetime
    context_data: Dict[str, Any]

# LangGraph State Definitions
class AgentState(TypedDict):
    context: Dict[str, Any]
    analysis: Dict[str, Any]
    decision: str
    actions: List[Dict[str, Any]]
    reasoning: str
    confidence_score: float

class BaseAgent:
    """Base class for all LangGraph-based AI agents"""

    def __init__(self, agent_type: AgentType, name: str):
        self.agent_type = agent_type
        self.name = name
        self.logger = logging.getLogger(f"app.agents.{agent_type.value}")

        # Initialize OpenAI LLM or Mock
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key.startswith("your_"):
            self.logger.warning("OPENAI_API_KEY unavailable. Using Mock LLM.")
            self.llm = MockLLM()
        else:
            self.llm = ChatOpenAI(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.1")),
                openai_api_key=api_key
            )

        # Build the LangGraph workflow
        self.workflow = self._build_workflow()

    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow for this agent"""
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("make_decision", self._make_decision)
        workflow.add_node("generate_actions", self._generate_actions)
        workflow.add_node("validate_decision", self._validate_decision)

        # Define edges
        workflow.set_entry_point("analyze_context")
        workflow.add_edge("analyze_context", "make_decision")
        workflow.add_edge("make_decision", "generate_actions")
        workflow.add_edge("generate_actions", "validate_decision")
        workflow.add_edge("validate_decision", END)

        return workflow.compile()

    def _analyze_context(self, state: AgentState) -> AgentState:
        """Analyze the context data using LLM"""
        context = state["context"]

        prompt = f"""
        Analyze the following context data for {self.name}:

        {context}

        Provide a structured analysis of the key insights and patterns you observe.
        Focus on {self.get_analysis_focus()}.

        Return your analysis as a JSON object with the following structure:
        {{
            "key_insights": ["insight1", "insight2", ...],
            "patterns": ["pattern1", "pattern2", ...],
            "risks": ["risk1", "risk2", ...],
            "opportunities": ["opportunity1", "opportunity2", ...]
        }}
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            analysis = JsonOutputParser().parse(response.content)
            state["analysis"] = analysis
        except Exception as e:
            self.logger.error(f"Error in context analysis: {e}")
            state["analysis"] = {
                "key_insights": ["Analysis failed due to error"],
                "patterns": [],
                "risks": ["Analysis error occurred"],
                "opportunities": []
            }

        return state

    def _make_decision(self, state: AgentState) -> AgentState:
        """Make a decision based on the analysis"""
        analysis = state["analysis"]
        context = state["context"]

        prompt = f"""
        Based on the following analysis and context, make a decision for {self.name}:

        ANALYSIS:
        {analysis}

        CONTEXT:
        {context}

        {self.get_decision_prompt()}

        Return your decision as a JSON object with the following structure:
        {{
            "decision": "brief decision statement",
            "reasoning": "detailed explanation of the decision",
            "confidence_score": 0.0-1.0
        }}
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            decision_data = JsonOutputParser().parse(response.content)
            state.update(decision_data)
        except Exception as e:
            self.logger.error(f"Error in decision making: {e}")
            state.update({
                "decision": "Unable to make decision due to error",
                "reasoning": f"Decision process failed: {str(e)}",
                "confidence_score": 0.0
            })

        return state

    def _generate_actions(self, state: AgentState) -> AgentState:
        """Generate actionable recommendations"""
        decision = state["decision"]
        analysis = state["analysis"]
        context = state["context"]

        prompt = f"""
        Based on the decision and analysis, generate specific actionable recommendations for {self.name}:

        DECISION: {decision}
        ANALYSIS: {analysis}
        CONTEXT: {context}

        {self.get_action_prompt()}

        Return actions as a JSON array with objects having this structure:
        [
            {{
                "action_type": "action_name",
                "description": "detailed description",
                "parameters": {{"key": "value"}},
                "priority": "LOW|MEDIUM|HIGH|CRITICAL",
                "requires_approval": true|false,
                "estimated_impact": "description of impact"
            }}
        ]
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            actions_data = JsonOutputParser().parse(response.content)
            state["actions"] = actions_data
        except Exception as e:
            self.logger.error(f"Error in action generation: {e}")
            state["actions"] = [{
                "action_type": "error_handling",
                "description": "Error occurred during action generation",
                "parameters": {},
                "priority": "LOW",
                "requires_approval": False,
                "estimated_impact": "None"
            }]

        return state

    def _validate_decision(self, state: AgentState) -> AgentState:
        """Validate the decision and actions"""
        # Basic validation - can be extended
        if not state.get("decision"):
            state["confidence_score"] = 0.0
            state["reasoning"] += " (Decision validation failed)"

        if not state.get("actions"):
            state["actions"] = []

        return state

    async def execute_action(self, action: AgentAction) -> Dict[str, Any]:
        """Execute a specific action"""
        self.logger.info(f"Executing action: {action.action_type}")
        
        # In a real system, this would trigger actual business logic
        # For now, we'll simulate execution and return a success result
        
        return {
            "success": True,
            "action_type": action.action_type,
            "timestamp": datetime.now(),
            "details": f"Executed {action.action_type} with parameters: {action.parameters}",
            "simulated": True
        }

    async def analyze(self, context: Dict[str, Any]) -> AgentDecision:
        """Run the complete analysis workflow"""
        try:
            # Initialize state
            initial_state: AgentState = {
                "context": context,
                "analysis": {},
                "decision": "",
                "actions": [],
                "reasoning": "",
                "confidence_score": 0.0
            }

            # Run the workflow
            final_state = await self.workflow.ainvoke(initial_state)

            # Convert actions to AgentAction objects
            actions = []
            for action_data in final_state["actions"]:
                try:
                    priority = AgentPriority[action_data.get("priority", "MEDIUM")]
                    actions.append(AgentAction(
                        action_type=action_data["action_type"],
                        description=action_data["description"],
                        parameters=action_data.get("parameters", {}),
                        priority=priority,
                        requires_approval=action_data.get("requires_approval", False),
                        estimated_impact=action_data.get("estimated_impact")
                    ))
                except (KeyError, ValueError) as e:
                    self.logger.warning(f"Invalid action data: {action_data}, error: {e}")
                    continue

            return AgentDecision(
                agent_type=self.agent_type,
                decision=final_state["decision"],
                confidence_score=min(1.0, max(0.0, final_state["confidence_score"])),
                actions=actions,
                reasoning=final_state["reasoning"],
                timestamp=datetime.now(),
                context_data=context
            )

        except Exception as e:
            self.logger.error(f"Error in agent analysis: {e}")
            return AgentDecision(
                agent_type=self.agent_type,
                decision="Analysis failed",
                confidence_score=0.0,
                actions=[],
                reasoning=f"Agent analysis failed due to error: {str(e)}",
                timestamp=datetime.now(),
                context_data=context
            )

    def get_capabilities(self) -> List[str]:
        """Return the capabilities of this agent"""
        return [
            "Analyze context data using advanced AI",
            "Make intelligent decisions based on patterns",
            "Generate actionable recommendations",
            "Provide confidence scoring for decisions",
            "Adapt to specific business contexts"
        ]

    def get_analysis_focus(self) -> str:
        """Return the specific focus area for analysis"""
        return "general business patterns and insights"

    def get_decision_prompt(self) -> str:
        """Return the specific decision-making prompt"""
        return "Make a strategic decision based on the analysis."

    def get_action_prompt(self) -> str:
        """Return the specific action generation prompt"""
        return "Generate 2-4 specific, actionable recommendations that can be implemented."


class InventoryOptimizationAgent(BaseAgent):
    """LangGraph-based agent for inventory optimization"""

    def __init__(self):
        super().__init__(AgentType.INVENTORY_OPTIMIZATION, "Inventory Optimizer")

    def get_capabilities(self) -> List[str]:
        return [
            "Monitor stock levels and inventory health",
            "Calculate optimal reorder points",
            "Predict stockouts and overstock situations",
            "Suggest inventory adjustments",
            "Optimize safety stock levels",
            "Analyze inventory turnover rates"
        ]

    def get_analysis_focus(self) -> str:
        return "inventory levels, stock patterns, reorder points, and supply chain efficiency"

    def get_decision_prompt(self) -> str:
        return """
        Based on the inventory data, make a decision about inventory optimization.
        Consider:
        - Current stock levels vs reorder points
        - Sales velocity and demand patterns
        - Stockout risks and overstock costs
        - Optimal reorder quantities
        - Safety stock requirements
        """

    def get_action_prompt(self) -> str:
        return """
        Generate specific inventory actions.
        CRITICAL: Return strictly a JSON array of objects.
        
        Supported 'action_type' values:
        - "update_stock_quantity": For changing stock levels (Must include 'product_id' and 'quantity_change' in parameters)
        - "update_product_price": For changing prices (Must include 'product_id' and 'new_price' in parameters)
        - "create_alert": For notifications (Must include 'message' in parameters)

        Example:
        [
            {
                "action_type": "update_stock_quantity",
                "description": "Restock Red Lipstick due to low stock",
                "parameters": {"product_id": 1, "quantity_change": 20},
                "priority": "HIGH",
                "requires_approval": true,
                "estimated_impact": "Prevent stockout in 2 days"
            }
        ]
        """


class DemandForecastingAgent(BaseAgent):
    """LangGraph-based agent for demand forecasting"""

    def __init__(self):
        super().__init__(AgentType.DEMAND_FORECASTING, "Demand Forecaster")

    def get_capabilities(self) -> List[str]:
        return [
            "Analyze sales patterns and trends",
            "Forecast future demand using AI",
            "Identify seasonal trends and patterns",
            "Detect demand anomalies",
            "Suggest inventory adjustments based on forecasts",
            "Provide demand uncertainty estimates"
        ]

    def get_analysis_focus(self) -> str:
        return "sales history, demand patterns, seasonal trends, and forecasting accuracy"

    def get_decision_prompt(self) -> str:
        return """
        Based on sales history and patterns, make a demand forecasting decision.
        Consider:
        - Historical sales trends and seasonality
        - Recent demand changes and anomalies
        - Forecast accuracy and confidence
        - Inventory implications of the forecast
        - Market conditions and external factors
        """

    def get_action_prompt(self) -> str:
        return """
        Generate demand-related actions such as:
        - Inventory level adjustments based on forecast
        - Seasonal stock preparations
        - Demand monitoring recommendations
        - Forecast model updates
        - Alert thresholds for demand changes
        """


class PricingOptimizationAgent(BaseAgent):
    """LangGraph-based agent for pricing optimization"""

    def __init__(self):
        super().__init__(AgentType.PRICING_OPTIMIZATION, "Pricing Optimizer")

    def get_capabilities(self) -> List[str]:
        return [
            "Analyze pricing vs demand correlation",
            "Suggest optimal price points",
            "Monitor competitor pricing",
            "Optimize profit margins",
            "Implement dynamic pricing strategies",
            "Analyze price elasticity"
        ]

    def get_analysis_focus(self) -> str:
        return "pricing strategies, competitor analysis, demand elasticity, and profit optimization"

    def get_decision_prompt(self) -> str:
        return """
        Based on pricing data and market conditions, make a pricing optimization decision.
        Consider:
        - Current pricing vs demand relationships
        - Competitor pricing strategies
        - Profit margin optimization
        - Price elasticity effects
        - Market positioning goals
        """

    def get_action_prompt(self) -> str:
        return """
        Generate pricing actions.
        CRITICAL: Return strictly a JSON array of objects.
        
        Supported 'action_type' values:
        - "update_product_price": For changing prices (Must include 'product_id' and 'new_price' in parameters)
        - "create_alert": For notifications

        Example:
        [
            {
                "action_type": "update_product_price",
                "description": "Decrease price for seasonal sale",
                "parameters": {"product_id": 2, "new_price": 19.99},
                "priority": "MEDIUM",
                "requires_approval": true,
                "estimated_impact": "Increase sales volume by 15%"
            }
        ]
        """