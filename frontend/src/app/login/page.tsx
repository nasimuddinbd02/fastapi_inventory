"use client"


import React from 'react'
import { useRouter } from 'next/navigation'
import AuthPanel from '@/components/auth/AuthPanel'
import { SessionUser } from '@/lib/auth'

export default function LoginPage(){
  const router = useRouter()

  function handleSuccess(_user: SessionUser){
    router.replace('/')
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Hero Section */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-lg text-white space-y-6">
          <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Inventory <span className="text-emerald-400">Mastery</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Streamline your supply chain with our next-generation inventory management system. 
            Real-time tracking, AI-powered insights, and seamless dispatching.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs text-slate-400">Monitoring</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-xs text-slate-400">SKUs Managed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account to manage your inventory.</p>
          </div>
          
          <AuthPanel onSuccess={handleSuccess} />
          
          <div className="pt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
