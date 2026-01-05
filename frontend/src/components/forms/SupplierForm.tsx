"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { useAppSelector } from '@/store/hooks'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: {
    id?: number | string
    supplier_name: string
    contact_email?: string | null
    contact_info?: string | null
  } | null
}

export function SupplierForm({ open, onOpenChange, editData }: SupplierFormProps) {
  const [supplierName, setSupplierName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = useAppSelector(state => state.auth.token)

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setSupplierName(editData.supplier_name || '')
      setContactEmail(editData.contact_email || '')
      setContactInfo(editData.contact_info || '')
    } else {
      setSupplierName('')
      setContactEmail('')
      setContactInfo('')
    }
  }, [editData, open])

  const handleClose = () => {
    setSupplierName('')
    setContactEmail('')
    setContactInfo('')
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supplierName.trim() || supplierName.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Supplier name must be at least 2 characters"
      })
      return
    }

    if (!contactEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Contact email is required"
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address"
      })
      return
    }

    setIsSubmitting(true)

    const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
    const authToken = token ?? fallbackToken

    try {
      if (editData) {
        // Update existing supplier
        await axios.put(
          `${buildApiUrl(API_ENDPOINTS.SUPPLIERS)}/${editData.id}`,
          {
            supplier_name: supplierName.trim(),
            contact_email: contactEmail.trim(),
            contact_info: contactInfo.trim() || null
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toast({
          variant: "success",
          title: "Supplier Updated",
          description: `${supplierName} has been updated successfully`
        })
      } else {
        // Create new supplier
        await axios.post(
          buildApiUrl(API_ENDPOINTS.SUPPLIERS),
          {
            supplier_name: supplierName.trim(),
            contact_email: contactEmail.trim(),
            contact_info: contactInfo.trim() || null
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toast({
          variant: "success",
          title: "Supplier Created",
          description: `${supplierName} has been added successfully`
        })
      }

      handleClose()
      
      // Trigger refresh of suppliers list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('suppliers:updated'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.detail 
        || error.message 
        || 'An error occurred'
      toast({
        variant: "destructive",
        title: editData ? "Failed to Update Supplier" : "Failed to Create Supplier",
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editData ? 'Edit Supplier' : 'Add New Supplier'}</SheetTitle>
          <SheetDescription>
            {editData ? 'Update the supplier details' : 'Enter the supplier details to add a new supplier'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="supplier-name">
              Supplier Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="supplier-name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              disabled={isSubmitting}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Contact Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="supplier@example.com"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-info">Contact Info</Label>
            <Textarea
              id="contact-info"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone, address, or other contact details (optional)"
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update Supplier' : 'Create Supplier')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
