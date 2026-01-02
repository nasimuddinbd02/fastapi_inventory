"use client"
import React from 'react'

export default function Header({ onOpenProduct, onToggleSidebar }: { onOpenProduct?: ()=>void; onToggleSidebar?: ()=>void }){
  return (
    <header className="bg-white border-b h-14 flex items-center sticky top-0 z-40">
      <div className="w-full px-4 flex items-center">
        <div className="flex items-center gap-4">
          {/* mobile menu button */}
          <button onClick={() => onToggleSidebar?.()} className="md:hidden px-2 py-1 mr-2">☰</button>
          <h2 className="text-lg font-bold text-left">AI Base Inventory Management System</h2>
        </div>
      </div>
    </header>
  )
}
