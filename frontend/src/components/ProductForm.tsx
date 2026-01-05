"use client"
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'

type ProductFormProps = {
  open: boolean
  onClose: () => void
}

export default function ProductForm({ open, onClose }: ProductFormProps){
  const token = useAppSelector(state => state.auth.token)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const quantityNumber = useMemo(()=>{
    if (quantity.trim() === '') return 0
    const parsed = Number(quantity)
    return Number.isNaN(parsed) ? NaN : parsed
  }, [quantity])

  useEffect(()=>{
    if (!open){
      setName('')
      setDescription('')
      setQuantity('')
      setError('')
      setSubmitting(false)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    if (Number.isNaN(quantityNumber)){
      setError('Quantity must be a number')
      return
    }
    setSubmitting(true)
    setError('')
    try{
      const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      const authToken = token ?? fallbackToken
      await axios.post(buildApiUrl(API_ENDPOINTS.INVENTORY), { name, description, quantity: quantityNumber }, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('products:updated'))
      }
      onClose()
    }catch(err: any){
      setError(err?.response?.data?.detail || err.message || 'Failed to save product')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen)=>{ if (!nextOpen) onClose() }}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Product</SheetTitle>
          <SheetDescription>Provide product details to add it to inventory.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={e=>setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={e=>setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-quantity">Quantity</Label>
            <Input
              id="product-quantity"
              type="number"
              value={quantity}
              onChange={e=>setQuantity(e.target.value)}
              min={0}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save product'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
