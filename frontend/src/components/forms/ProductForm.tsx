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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Product title is required"
      })
      return
    }

    const price = parseFloat(unitPrice)
    if (isNaN(price) || price <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Unit price must be greater than 0"
      })
      return
    }

    if (!categoryName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Category is required"
      })
      return
    }

    if (!supplierName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Supplier is required"
      })
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

        toast({
          variant: "success",
          title: "Product Updated",
          description: `${productTitle} has been updated successfully`
        })
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

        toast({
          variant: "success",
          title: "Product Created",
          description: `${productTitle} has been added successfully`
        })
      }

      handleClose()
      
      // Trigger refresh of products list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('products:updated'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.detail 
        || error.message 
        || 'An error occurred'
      toast({
        variant: "destructive",
        title: editData ? "Failed to Update Product" : "Failed to Create Product",
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
          <SheetTitle>{editData ? 'Edit Product' : 'Add New Product'}</SheetTitle>
          <SheetDescription>
            {editData ? 'Update the product details' : 'Enter the product details to add a new item to inventory'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="product-title">
              Product Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="product-title"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Enter product title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Enter product description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-price">
              Unit Price <span className="text-red-500">*</span>
            </Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={categoryName} 
              onValueChange={setCategoryName}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">
              Supplier <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={supplierName} 
              onValueChange={setSupplierName}
              disabled={isSubmitting}
            >
              <SelectTrigger id="supplier">
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
              {isSubmitting ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
