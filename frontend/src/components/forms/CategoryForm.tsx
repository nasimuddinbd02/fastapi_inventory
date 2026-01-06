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
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FormSection, FormField, FormActions, RequiredMark } from '@/components/ui/form-section'
import { Tags, FileText, Loader2, Save, X } from 'lucide-react'

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
      toastValidation.required('Category name')
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

        toastSuccess.updated('Category', categoryName)
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

        toastSuccess.created('Category', categoryName)
      }

      handleClose()
      
      // Trigger refresh of categories list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categories:updated'))
      }
    } catch (error: unknown) {
      handleApiError(error, editData ? 'update' : 'create', 'category')
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
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{editData ? 'Edit Category' : 'Add New Category'}</SheetTitle>
              <SheetDescription>
                {editData ? 'Update the category details below' : 'Create a new category for your products'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <Separator className="mb-6" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Basic Information" icon={<FileText className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="category-name" className="text-sm font-medium">
                Category Name<RequiredMark />
              </Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Electronics, Furniture, Clothing"
                required
                disabled={isSubmitting}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name for the category
              </p>
            </FormField>

            <FormField>
              <Label htmlFor="category-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what products belong in this category..."
                rows={4}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add details to help identify products for this category
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
                  {editData ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </FormActions>
        </form>
      </SheetContent>
    </Sheet>
  )
}
