"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { toastSuccess, toastError } from '@/lib/toast-messages'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { fetchCategories, deleteCategory, setPage, type Category } from '@/store/categoriesSlice'
import { selectSettings } from '@/store/settingsSlice'

const columns: Array<Column<Category>> = [
  {
    key: 'category_name',
    header: 'Name',
    render: item => item.category_name,
    sortValue: item => item.category_name?.toLowerCase() || '',
    filterValue: item => item.category_name || ''
  },
  {
    key: 'category_description',
    header: 'Description',
    render: item => item.category_description || '--',
    sortValue: item => item.category_description?.toLowerCase() || '',
    filterValue: item => item.category_description || ''
  },
  {
    key: 'created_at',
    header: 'Created',
    render: item => item.created_at || '--',
    sortValue: item => item.created_at || '',
    filterValue: item => item.created_at || ''
  }
]

export default function SettingsCategoriesView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.categories)
  const settings = useAppSelector(selectSettings)
  const effectivePageSize = settings.items_per_page || pageSize

  useEffect(() => {
    dispatch(fetchCategories({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleAdd = useCallback(()=>{
    setEditingCategory(null)
    setShowAddForm(true)
  }, [])

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setShowAddForm(true)
  }, [])

  const handleCloseForm = useCallback((isOpen: boolean) => {
    setShowAddForm(isOpen)
    if (!isOpen) {
      setEditingCategory(null)
      dispatch(fetchCategories({ page, pageSize: effectivePageSize, search }))
    }
  }, [dispatch, page, effectivePageSize, search])

  const handleDelete = useCallback(async (category: Category)=>{
    if (!category.id) return
    
    try {
      await dispatch(deleteCategory(category.id)).unwrap()
      
      toastSuccess.deleted('Category', category.category_name)
      
      dispatch(fetchCategories({ page, pageSize: effectivePageSize, search }))
    } catch (error) {
      toastError.deleteFailed(error instanceof Error ? error.message : 'category')
      throw error
    }
  }, [dispatch, page, effectivePageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8 pt-4">
      <p className="text-sm text-muted-foreground">Organize your products by creating and managing categories. Categories help streamline inventory tracking and reporting.</p>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleAdd} className="w-fit">
              <Plus />
              Add Category
            </Button>
            <span className="text-xs text-gray-500">{loading ? 'Loading categories...' : `Total: ${total}`}</span>
            {!loading && total > 0 && (
              <span className="text-xs text-gray-500">Showing: {items.length}</span>
            )}
            {!loading && search.trim() && (
              <span className="text-xs text-gray-500">Matches: {total}</span>
            )}
          </div>
        </div>
        <div className="w-full md:w-64">
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            disabled={!!error}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <DataTable<Category>
          data={items}
          columns={columns}
          emptyMessage="No categories found."
          loading={loading}
          page={page}
          pageSize={effectivePageSize}
          total={total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onRowDoubleClick={handleEdit}
        />
      )}

      <CategoryForm 
        open={showAddForm} 
        onOpenChange={handleCloseForm}
        editData={editingCategory}
      />
    </div>
  )
}
