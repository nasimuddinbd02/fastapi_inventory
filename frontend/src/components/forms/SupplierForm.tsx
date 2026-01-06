"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toastSuccess, toastValidation, handleApiError } from '@/lib/toast-messages'
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
import { Separator } from "@/components/ui/separator"
import { FormSection, FormField, FormActions, RequiredMark } from '@/components/ui/form-section'
import { Building2, User, Mail, Phone, Loader2, Save, X } from 'lucide-react'

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
      toastValidation.minLength('Supplier name', 2)
      return
    }

    if (!contactEmail.trim()) {
      toastValidation.required('Contact email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail.trim())) {
      toastValidation.invalidEmail()
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

        toastSuccess.updated('Supplier', supplierName)
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

        toastSuccess.created('Supplier', supplierName)
      }

      handleClose()
      
      // Trigger refresh of suppliers list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('suppliers:updated'))
      }
    } catch (error: unknown) {
      handleApiError(error, editData ? 'update' : 'create', 'supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{editData ? 'Edit Supplier' : 'Add New Supplier'}</SheetTitle>
              <SheetDescription>
                {editData ? 'Update the supplier information' : 'Register a new supplier for your inventory'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <Separator className="mb-6" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Company Details" icon={<Building2 className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="supplier-name" className="text-sm font-medium">
                Supplier Name<RequiredMark />
              </Label>
              <Input
                id="supplier-name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g., ABC Trading Co., Global Supplies Inc."
                disabled={isSubmitting}
                required
                minLength={2}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Company or business name of the supplier
              </p>
            </FormField>
          </FormSection>

          <FormSection title="Contact Information" icon={<User className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="contact-email" className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address<RequiredMark />
                </span>
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@supplier.com"
                disabled={isSubmitting}
                required
                className="h-10"
              />
            </FormField>

            <FormField>
              <Label htmlFor="contact-info" className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Additional Contact Info
                </span>
              </Label>
              <Textarea
                id="contact-info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone number, address, or other contact details..."
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Include phone, fax, or physical address
              </p>
            </FormField>
          </FormSection>

          <FormActions sticky>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editData ? 'Update Supplier' : 'Create Supplier'}
                </>
              )}
            </Button>
          </FormActions>
        </form>
      </SheetContent>
    </Sheet>
  )
}
