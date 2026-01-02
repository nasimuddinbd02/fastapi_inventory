"use client"

import React from 'react'

export default function DashboardView(){
  return (
    <div className="container">
      <h1 className="text-2xl font-semibold mb-4">Welcome to the AI Base Inventory Management System</h1>
      <p className="text-sm text-gray-500">
        Select an option from the sidebar to manage products, suppliers, categories, and more. This dashboard will display the active module in the center.
      </p>
    </div>
  )
}
