"use client"

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { toastSuccess, toastError } from '@/lib/toast-messages'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { ProductForm } from '@/components/forms/ProductForm'
import { fetchProducts, deleteProduct, setPage, type Product } from '@/store/productsSlice'
import { selectSettings } from '@/store/settingsSlice'

export default function SettingsProductsView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.products)
  const settings = useAppSelector(selectSettings)
  const effectivePageSize = settings.items_per_page || pageSize
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency || 'USD' }), [settings.currency])

  useEffect(() => {
    dispatch(fetchProducts({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleAdd = useCallback(()=>{
    setEditingProduct(null)
    setShowAddForm(true)
  }, [])

  const handleEdit = useCallback((product: Product)=>{
    setEditingProduct(product)
    setShowAddForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false)
    setEditingProduct(null)
    dispatch(fetchProducts({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleDelete = useCallback(async (product: Product)=>{
    if (!product.id) return
    
    try {
      await dispatch(deleteProduct(product.id)).unwrap()
      
      toastSuccess.deleted('Product', product.product_title)
      
      dispatch(fetchProducts({ page, pageSize: effectivePageSize, search }))
    } catch (error) {
      toastError.deleteFailed(error instanceof Error ? error.message : 'product')
      throw error
    }
  }, [dispatch, page, effectivePageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  const columns: Array<Column<Product>> = useMemo(() => ([
    {
      key: 'product_title',
      header: 'Title',
      render: item => item.product_title,
      sortValue: item => item.product_title?.toLowerCase() || '',
      filterValue: item => item.product_title || ''
    },
    {
      key: 'product_description',
      header: 'Description',
      render: item => item.product_description || '--',
      sortValue: item => item.product_description?.toLowerCase() || '',
      filterValue: item => item.product_description || ''
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      render: item => (typeof item.unit_price === 'number' ? currencyFormatter.format(item.unit_price) : '--'),
      sortValue: item => (typeof item.unit_price === 'number' ? item.unit_price : Number.POSITIVE_INFINITY),
      filterValue: item => (typeof item.unit_price === 'number' ? item.unit_price.toString() : '')
    },
    {
      key: 'category',
      header: 'Category',
      render: item => item.category?.category_name || '--',
      sortValue: item => item.category?.category_name?.toLowerCase() || '',
      filterValue: item => item.category?.category_name || ''
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: item => item.supplier?.supplier_name || '--',
      sortValue: item => item.supplier?.supplier_name?.toLowerCase() || '',
      filterValue: item => item.supplier?.supplier_name || ''
    }
  ]), [currencyFormatter])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8 pt-4">
      <p className="text-sm text-muted-foreground">Manage your product catalog including pricing, stock levels, and category assignments. Add, edit, or remove products as needed.</p>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleAdd} className="w-fit">
              <Plus />
              Add Product
            </Button>
            <span className="text-xs text-gray-500">{loading ? 'Loading products...' : `Total: ${total}`}</span>
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
            placeholder="Search products..."
            aria-label="Search products"
            disabled={!!error}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <DataTable<Product>
          data={items}
          columns={columns}
          emptyMessage="No products found."
          loading={loading}
          page={page}
          pageSize={effectivePageSize}
          total={total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onRowDoubleClick={handleEdit}
        />
      )}

      <ProductForm 
        open={showAddForm} 
        onOpenChange={handleCloseForm}
        editData={editingProduct}
      />
    </div>
  )
}
