from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.agents import AgentType, AgentAction

class AgentAnalysisRequest(BaseModel):
    """Request model for agent analysis"""
    context: Dict[str, Any] = Field(..., description="Context data for the agent to analyze")

class AgentAnalysisResponse(BaseModel):
    """Response model for agent analysis"""
    agent_type: AgentType
    decision: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    actions: List[AgentAction]
    reasoning: str
    timestamp: datetime
    context_summary: str

class AgentCapabilitiesResponse(BaseModel):
    """Response model for agent capabilities"""
    agents: Optional[List[Dict[str, Any]]] = None
    agent_type: Optional[str] = None
    name: Optional[str] = None
    capabilities: Optional[List[str]] = None

class AgentStatusResponse(BaseModel):
    """Response model for agent status"""
    total_agents: int
    active_agents: int
    total_decisions: int
    agents: List[Dict[str, Any]]

class AgentDecisionHistoryResponse(BaseModel):
    """Response model for decision history"""
    agent_type: AgentType
    decision: str
    confidence_score: float
    actions_count: int
    reasoning: str
    timestamp: datetime

class AgentActionExecutionRequest(BaseModel):
    """Request model for executing agent actions"""
    agent_type: AgentType
    action: AgentAction

class AgentActionExecutionResponse(BaseModel):
    """Response model for agent action execution"""
    agent_type: AgentType
    action_type: str
    success: bool
    result: Dict[str, Any]
    executed_at: datetime