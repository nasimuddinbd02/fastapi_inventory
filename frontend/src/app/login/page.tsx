"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import AuthPanel from '@/components/auth/AuthPanel'
import { SessionUser } from '@/lib/auth'
import { CheckCircle2, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react'

export default function LoginPage(){
  const router = useRouter()

  function handleSuccess(_user: SessionUser){
    router.replace('/')
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Hero Section - Left Side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-950 items-center justify-center p-12">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 z-0"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-xl space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          
          {/* Logo & Brand */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/20 mb-4">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Inventory <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Mastery
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed max-w-md">
              The complete operating system for modern inventory management. 
              Intelligent tracking, real-time insights, and seamless automation.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors duration-300">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div className="font-semibold text-white">Real-time Sync</div>
              <div className="text-xs text-slate-400">Instant stock updates across all channels.</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors duration-300">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <div className="font-semibold text-white">Advanced Analytics</div>
              <div className="text-xs text-slate-400">Data-driven decisions with detailed reports.</div>
            </div>
          </div>

          <div className="flex gap-6 pt-4 items-center">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] text-white overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br ${['from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-purple-400 to-purple-600', 'from-orange-400 to-orange-600'][i-1]}`}></div>
                 </div>
               ))}
            </div>
            <div className="text-sm text-slate-400">
              Trusted by <span className="text-white font-medium">500+</span> companies
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section - Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl bg-primary/10 mb-4">
               <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-primary"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your workspace.</p>
          </div>

          <AuthPanel onSuccess={handleSuccess} />

          <p className="px-8 text-center text-xs text-muted-foreground mt-8">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
