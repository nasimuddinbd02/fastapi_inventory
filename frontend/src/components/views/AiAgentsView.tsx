
"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Bot, 
  Brain, 
  TrendingUp, 
  LineChart, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ClipboardCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { useToast } from '@/hooks/use-toast'
import { AgentAnalysisResponse, AgentStatusResponse } from '@/types/agent'

export default function AiAgentsView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set())

  const [executingAction, setExecutingAction] = useState<string | null>(null)
  
  const [status, setStatus] = useState<AgentStatusResponse | null>(null)
  const [decisions, setDecisions] = useState<AgentAnalysisResponse[]>([])
  const [contextData, setContextData] = useState<any>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await axios.get(buildApiUrl(`${API_ENDPOINTS.AGENTS}/status`))
      setStatus(res.data)
    } catch (err) {
      console.error("Failed to fetch agent status", err)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    try {
      setAnalyzing(true)
      
      // 1. Fetch Context
      const contextRes = await axios.post(buildApiUrl(`${API_ENDPOINTS.AGENTS}/context`))
      const context = contextRes.data
      setContextData(context)
      
      // 2. Run Analysis
      const analysisRes = await axios.post(
        buildApiUrl(`${API_ENDPOINTS.AGENTS}/analyze/all`),
        { context: context }
      )
      
      setDecisions(analysisRes.data)
      toast({
        title: "Analysis Complete",
        description: `Successfully generated insights from ${analysisRes.data.length} agents.`,
        variant: "success",
      })
      
      // Update status to reflect new decisions
      fetchStatus()
      
    } catch (err) {
      console.error("Analysis failed", err)
      toast({
        title: "Analysis Failed",
        description: "Could not complete the agent analysis workflow.",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const executeAction = async (agentType: string, action: any) => {
    const actionKey = `${agentType}-${action.description}` // simple unique key for session
    setExecutingAction(actionKey)
    try {
      await axios.post(buildApiUrl(`${API_ENDPOINTS.AGENTS}/execute-action`), {
        agent_type: agentType,
        action: action
      })
      
      setExecutedActions(prev => {
        const next = new Set(prev)
        next.add(actionKey)
        return next
      })

      toast({
        title: "Action Executed",
        description: "The recommended action has been successfully executed.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Execution Failed",
        description: "Failed to execute the action. Please try again.",
        variant: "destructive"
      })
    } finally {
      setExecutingAction(null)
    }
  }

  const getAgentIcon = (type: string) => {
    switch(type) {
      case 'inventory_optimization': return <Bot className="h-6 w-6 text-emerald-500" />
      case 'demand_forecasting': return <TrendingUp className="h-6 w-6 text-blue-500" />
      case 'pricing_optimization': return <LineChart className="h-6 w-6 text-purple-500" />
      default: return <Brain className="h-6 w-6 text-slate-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-500 hover:bg-red-600'
      case 'HIGH': return 'bg-orange-500 hover:bg-orange-600'
      case 'MEDIUM': return 'bg-blue-500 hover:bg-blue-600'
      case 'LOW': return 'bg-slate-500 hover:bg-slate-600'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            AI Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time intelligent analysis and automated decision making.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="outline" 
            onClick={fetchStatus} 
            disabled={loading || analyzing}
            className="gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button 
            onClick={runAnalysis} 
            disabled={analyzing} 
            className="gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300"
          >
            {analyzing ? (
              <>
                <Brain className="h-4 w-4 animate-pulse" />
                Running Analysis...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Run Full Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Status & Context */}
        <div className="space-y-6 lg:col-span-1">
            {/* Agent Status Cards */}
            <div className="grid grid-cols-1 gap-4">
                {status?.agents.map((agent) => (
                    <Card key={agent.type} className="overflow-hidden border-l-4 border-l-primary">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {getAgentIcon(agent.type)}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{agent.name}</h3>
                                    <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium">Last Run</div>
                                <div className="text-xs text-muted-foreground">
                                    {agent.last_decision ? new Date(agent.last_decision).toLocaleTimeString() : 'Never'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Context Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        System Context
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contextData ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Products</span>
                                <span className="font-medium">{contextData.products?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Sales Records</span>
                                <span className="font-medium">{contextData.sales_history?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Active Orders</span>
                                <span className="font-medium">12</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Run analysis to load context data.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Insights & Actions */}
        <div className="lg:col-span-2 space-y-6">
            {!decisions.length && !analyzing && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 bg-slate-50 dark:bg-slate-900/50">
                    <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                        The AI agents are ready to analyze your inventory data, predict demand, and optimize pricing. Click "Run Full Analysis" to begin.
                    </p>
                    <Button onClick={runAnalysis} variant="outline" className="gap-2">
                        <Play className="h-4 w-4" />
                        Start Analysis
                    </Button>
                </div>
            )}

            {analyzing && (
                <div className="h-full flex flex-col items-center justify-center p-12">
                     <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                        <Brain className="h-20 w-20 text-primary animate-bounce relative z-10" />
                     </div>
                     <h3 className="text-xl font-semibold mt-8 mb-2">Analyzing Data...</h3>
                     <p className="text-muted-foreground">Our AI agents are crunching the numbers.</p>
                </div>
            )}

            <div className="space-y-6">
                {decisions.map((decision, idx) => (
                    <Card key={idx} className="overflow-hidden border-t-4 border-t-primary shadow-md">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background shadow-sm rounded-lg border">
                                        {getAgentIcon(decision.agent_type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-primary">{decision.decision}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span className="capitalize text-foreground font-medium">
                                                {decision.agent_type.replace('_', ' ')} Agent
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                Conf: {(decision.confidence_score * 100).toFixed(0)}%
                                            </span>
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {new Date(decision.timestamp).toLocaleTimeString()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" /> Reasoning
                                    </h4>
                                    <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                                        {decision.reasoning}
                                    </p>
                                </div>

                                {decision.actions?.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" /> Recommended Actions
                                            </h4>
                                            <div className="grid gap-3">
                                                {decision.actions.map((action, actionIdx) => (
                                                    <div 
                                                        key={actionIdx} 
                                                        className="flex items-start justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                                                    >
                                                        <div className="flex gap-3">
                                                            {action.priority === 'CRITICAL' || action.priority === 'HIGH' ? (
                                                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                                            ) : (
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                                            )}
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{action.action_type}</span>
                                                                    <Badge className={`text-[10px] h-5 ${getPriorityColor(action.priority)} border-0`}>
                                                                        {action.priority}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">{action.description}</p>
                                                                {action.estimated_impact && (
                                                                     <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                        Impact: {action.estimated_impact}
                                                                     </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant={executedActions.has(`${decision.agent_type}-${action.description}`) ? "outline" : "default"}
                                                            disabled={!!executingAction || executedActions.has(`${decision.agent_type}-${action.description}`)}
                                                            onClick={() => executeAction(decision.agent_type, action)}
                                                            className={executedActions.has(`${decision.agent_type}-${action.description}`) ? "text-green-600 border-green-200 bg-green-50 text-xs shrink-0" : "text-xs shrink-0"}
                                                        >
                                                            {executingAction === `${decision.agent_type}-${action.description}` ? (
                                                                <span className="animate-pulse">Running...</span>
                                                            ) : executedActions.has(`${decision.agent_type}-${action.description}`) ? (
                                                                <>Executed <CheckCircle2 className="ml-1 h-3 w-3" /></>
                                                            ) : (
                                                                <>Execute <ArrowRight className="ml-1 h-3 w-3" /></>
                                                            )}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
