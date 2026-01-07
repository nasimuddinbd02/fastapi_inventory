
export interface AgentAction {
  action_type: string
  description: string
  parameters: Record<string, any>
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  requires_approval: boolean
  estimated_impact?: string
}

export interface AgentAnalysisResponse {
  agent_type: string
  decision: string
  confidence_score: number
  actions: AgentAction[]
  reasoning: string
  timestamp: string
  context_summary?: string
}

export interface AgentStatus {
    type: string
    name: string
    status: string
    last_decision?: string
}

export interface AgentStatusResponse {
    total_agents: number
    active_agents: number
    total_decisions: number
    agents: AgentStatus[]
}
