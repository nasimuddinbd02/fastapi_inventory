from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.services.agent_service import AgentService
from app.dependencies import get_agent_service
from app.agents import AgentType, AgentDecision, AgentAction
from app.viewmodels.agent import (
    AgentAnalysisRequest, AgentAnalysisResponse, AgentCapabilitiesResponse,
    AgentStatusResponse, AgentDecisionHistoryResponse, AgentActionExecutionRequest,
    AgentActionExecutionResponse
)
import logging

router_logger = logging.getLogger("app.routers.agents")

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/analyze/{agent_type}", response_model=AgentAnalysisResponse)
async def analyze_with_agent(
    agent_type: AgentType,
    request: AgentAnalysisRequest,
    service: AgentService = Depends(get_agent_service)
):
    """Run analysis with a specific AI agent"""
    router_logger.info(f"Running analysis with agent: {agent_type.value}")

    decision = await service.run_agent_analysis(agent_type, request.context)

    router_logger.info(f"Agent {agent_type.value} analysis completed with {len(decision.actions)} actions")
    return AgentAnalysisResponse(
        agent_type=decision.agent_type,
        decision=decision.decision,
        confidence_score=decision.confidence_score,
        actions=decision.actions,
        reasoning=decision.reasoning,
        timestamp=decision.timestamp,
        context_summary=f"Analysis based on {len(request.context)} context items"
    )

@router.post("/analyze/all", response_model=List[AgentAnalysisResponse])
async def analyze_with_all_agents(
    request: AgentAnalysisRequest,
    service: AgentService = Depends(get_agent_service)
):
    """Run analysis with all available AI agents"""
    router_logger.info("Running analysis with all agents")

    decisions = await service.run_all_agents(request.context)

    router_logger.info(f"All agents analysis completed. {len(decisions)} decisions made")
    return [
        AgentAnalysisResponse(
            agent_type=decision.agent_type,
            decision=decision.decision,
            confidence_score=decision.confidence_score,
            actions=decision.actions,
            reasoning=decision.reasoning,
            timestamp=decision.timestamp,
            context_summary=f"Analysis based on {len(request.context)} context items"
        )
        for decision in decisions
    ]

@router.post("/execute-action", response_model=AgentActionExecutionResponse)
async def execute_agent_action(
    request: AgentActionExecutionRequest,
    service: AgentService = Depends(get_agent_service)
):
    """Execute a specific agent action"""
    router_logger.info(f"Executing action: {request.action.action_type} for agent: {request.agent_type.value}")

    result = await service.execute_agent_action(request.agent_type, request.action)

    router_logger.info(f"Action {request.action.action_type} executed successfully")
    return AgentActionExecutionResponse(
        agent_type=request.agent_type,
        action_type=request.action.action_type,
        success=True,
        result=result,
        executed_at=datetime.now(timezone.utc)
    )

@router.get("/capabilities", response_model=AgentCapabilitiesResponse)
async def get_agent_capabilities(
    agent_type: Optional[AgentType] = Query(None, description="Specific agent type to get capabilities for"),
    service: AgentService = Depends(get_agent_service)
):
    """Get capabilities of AI agents"""
    capabilities = service.get_agent_capabilities(agent_type)
    return AgentCapabilitiesResponse(**capabilities)

@router.get("/status", response_model=AgentStatusResponse)
async def get_agent_status(service: AgentService = Depends(get_agent_service)):
    """Get status of all AI agents"""
    status = service.get_agent_status()
    return AgentStatusResponse(**status)

@router.get("/history", response_model=List[AgentDecisionHistoryResponse])
async def get_decision_history(
    agent_type: Optional[AgentType] = Query(None, description="Filter by agent type"),
    limit: int = Query(50, description="Number of decisions to return", ge=1, le=100),
    offset: int = Query(0, description="Number of decisions to skip", ge=0),
    service: AgentService = Depends(get_agent_service)
):
    """Get decision history from AI agents"""
    history = service.get_decision_history(agent_type, limit, offset)

    return [
        AgentDecisionHistoryResponse(
            agent_type=decision.agent_type,
            decision=decision.decision,
            confidence_score=decision.confidence_score,
            actions_count=len(decision.actions),
            reasoning=decision.reasoning,
            timestamp=decision.timestamp
        )
        for decision in history
    ]

@router.post("/context", response_model=dict)
async def get_agent_context(service: AgentService = Depends(get_agent_service)):
    """Get context data for agents (for testing/debugging)"""
    # In a real implementation, this would use a database session
    context = await service.get_context_for_agents(None)
    return {
        "context_items": len(context),
        "timestamp": context["timestamp"],
        "products_count": len(context["products"]),
        "sales_records": len(context["sales_history"]),
        "competitor_data": len(context["competitor_prices"])
    }