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
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: {
    id?: number | string
    category_name: string
    category_description?: string | null
  } | null
}

export function CategoryForm({ open, onOpenChange, editData }: CategoryFormProps) {
  const token = useAppSelector(state => state.auth.token)
  const [categoryName, setCategoryName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setCategoryName(editData.category_name || '')
      setDescription(editData.category_description || '')
    } else {
      setCategoryName('')
      setDescription('')
    }
  }, [editData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Category name is required'
      })
      return
    }

    setIsSubmitting(true)
    const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
    const authToken = token ?? fallbackToken

    try {
      if (editData) {
        // Update existing category
        await axios.put(
          buildApiUrl(`${API_ENDPOINTS.CATEGORIES}/${editData.id}`),
          {
            category_name: categoryName.trim(),
            category_description: description.trim() || null
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toast({
          variant: 'success',
          title: 'Category Updated',
          description: `${categoryName} has been updated successfully`
        })
      } else {
        // Create new category
        await axios.post(
          buildApiUrl(API_ENDPOINTS.CATEGORIES),
          {
            category_name: categoryName.trim(),
            category_description: description.trim() || null
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toast({
          variant: 'success',
          title: 'Category Created',
          description: `${categoryName} has been added successfully`
        })
      }

      handleClose()
      
      // Trigger refresh of categories list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categories:updated'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.detail 
        || error.message 
        || 'An error occurred'
      toast({
        variant: 'destructive',
        title: editData ? 'Failed to Update Category' : 'Failed to Create Category',
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCategoryName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editData ? 'Edit Category' : 'Add New Category'}</SheetTitle>
          <SheetDescription>
            {editData ? 'Update the category details below' : 'Enter the category details to add a new category'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description (optional)"
              rows={4}
              disabled={isSubmitting}
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
              {isSubmitting ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
