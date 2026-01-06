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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormSection, FormField, FormRow, FormActions, RequiredMark } from '@/components/ui/form-section'
import { Package, FileText, DollarSign, Tags, Building2, Loader2, Save, X } from 'lucide-react'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: {
    id?: number | string
    product_title: string
    product_description?: string | null
    unit_price?: number | null
    category?: { category_name?: string | null } | null
    supplier?: { supplier_name?: string | null } | null
  } | null
}

interface Category {
  category_id: number
  category_name: string
}

interface Supplier {
  supplier_id: number
  supplier_name: string
}

export function ProductForm({ open, onOpenChange, editData }: ProductFormProps) {
  const [productTitle, setProductTitle] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = useAppSelector(state => state.auth.token)

  // Fetch categories and suppliers when form opens
  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchSuppliers()
    }
  }, [open])

  // Populate form when editing (after categories/suppliers are loaded)
  useEffect(() => {
    if (editData && categories.length > 0 && suppliers.length > 0) {
      setProductTitle(editData.product_title || '')
      setProductDescription(editData.product_description || '')
      setUnitPrice(editData.unit_price?.toString() || '')
      setCategoryName(editData.category?.category_name || '')
      setSupplierName(editData.supplier?.supplier_name || '')
    } else if (!editData && open) {
      setProductTitle('')
      setProductDescription('')
      setUnitPrice('')
      setCategoryName('')
      setSupplierName('')
    }
  }, [editData, categories, suppliers, open])

  const fetchCategories = async () => {
    try {
      const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      const authToken = token ?? fallbackToken
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.CATEGORIES), {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      })
      setCategories(response.data.items || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const fetchSuppliers = async () => {
    try {
      const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      const authToken = token ?? fallbackToken
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.SUPPLIERS), {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      })
      setSuppliers(response.data.items || [])
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      setSuppliers([])
    }
  }

  const handleClose = () => {
    setProductTitle('')
    setProductDescription('')
    setUnitPrice('')
    setCategoryName('')
    setSupplierName('')
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productTitle.trim()) {
      toastValidation.required('Product title')
      return
    }

    const price = parseFloat(unitPrice)
    if (isNaN(price) || price <= 0) {
      toastValidation.custom('Invalid Price', 'Unit price must be greater than 0')
      return
    }

    if (!categoryName) {
      toastValidation.required('Category')
      return
    }

    if (!supplierName) {
      toastValidation.required('Supplier')
      return
    }

    setIsSubmitting(true)

    const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
    const authToken = token ?? fallbackToken

    try {
      if (editData) {
        // Update existing product
        await axios.put(
          `${buildApiUrl(API_ENDPOINTS.PRODUCTS)}/${editData.id}`,
          {
            product_title: productTitle.trim(),
            product_description: productDescription.trim() || null,
            unit_price: price,
            category_name: categoryName,
            supplier_name: supplierName
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toastSuccess.updated('Product', productTitle)
      } else {
        // Create new product
        await axios.post(
          buildApiUrl(API_ENDPOINTS.PRODUCTS),
          {
            product_title: productTitle.trim(),
            product_description: productDescription.trim() || null,
            unit_price: price,
            category_name: categoryName,
            supplier_name: supplierName
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toastSuccess.created('Product', productTitle)
      }

      handleClose()
      
      // Trigger refresh of products list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('products:updated'))
      }
    } catch (error: unknown) {
      handleApiError(error, editData ? 'update' : 'create', 'product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{editData ? 'Edit Product' : 'Add New Product'}</SheetTitle>
              <SheetDescription>
                {editData ? 'Update the product details' : 'Add a new product to your inventory catalog'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <Separator className="mb-6" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Product Information" icon={<FileText className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="product-title" className="text-sm font-medium">
                Product Title<RequiredMark />
              </Label>
              <Input
                id="product-title"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g., Wireless Mouse, Office Chair, USB Cable"
                disabled={isSubmitting}
                required
                className="h-10"
              />
            </FormField>

            <FormField>
              <Label htmlFor="product-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="product-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe the product features, specifications, or notes..."
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add details to help identify this product
              </p>
            </FormField>
          </FormSection>

          <FormSection title="Pricing" icon={<DollarSign className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="unit-price" className="text-sm font-medium">
                Unit Price<RequiredMark />
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  required
                  className="h-10 pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default selling price per unit
              </p>
            </FormField>
          </FormSection>

          <FormSection title="Classification" icon={<Tags className="h-4 w-4" />}>
            <FormRow>
              <FormField>
                <Label htmlFor="category" className="text-sm font-medium">
                  Category<RequiredMark />
                </Label>
                <Select 
                  value={categoryName} 
                  onValueChange={setCategoryName}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category" className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category_id} value={category.category_name}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField>
                <Label htmlFor="supplier" className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Supplier<RequiredMark />
                  </span>
                </Label>
                <Select 
                  value={supplierName} 
                  onValueChange={setSupplierName}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="supplier" className="h-10">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.supplier_id} value={supplier.supplier_name}>
                        {supplier.supplier_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </FormRow>
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
                  {editData ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </FormActions>
        </form>
      </SheetContent>
    </Sheet>
  )
}
