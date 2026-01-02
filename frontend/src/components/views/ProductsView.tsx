"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'

type Product = {
  id?: number | string
  name: string
  description?: string
  quantity?: number
}

export default function ProductsView(){
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      setError('')
      try{
        const res = await axios.get('http://localhost:8000/inventory')
        if (mounted) setProducts(res.data || [])
      }catch(err:any){
        if (mounted) setError(err?.message || 'Failed to load')
      }finally{
        if (mounted) setLoading(false)
      }
    }
    load()

    const handler = () => { load() }
    if (typeof window !== 'undefined') window.addEventListener('products:updated', handler)
    return () => {
      mounted = false
      if (typeof window !== 'undefined') window.removeEventListener('products:updated', handler)
    }
  },[])

  return (
    <div className="container">
      <h2 className="text-xl font-semibold mb-4">Products</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(p=> (
          <div key={p.id ?? p.name} className="p-4 border rounded bg-card">
            <h3 className="font-medium">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.description}</p>
            <div className="text-xs mt-2">Qty: {p.quantity ?? 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
