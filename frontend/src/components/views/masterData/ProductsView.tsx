"use client"

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { ProductForm } from '@/components/forms/ProductForm'
import { fetchProducts, deleteProduct, setPage, type Product } from '@/store/productsSlice'

export default function SettingsProductsView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.products)
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

  useEffect(() => {
    dispatch(fetchProducts({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

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
    dispatch(fetchProducts({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

  const handleDelete = useCallback(async (product: Product)=>{
    if (!product.id) return
    
    try {
      await dispatch(deleteProduct(product.id)).unwrap()
      
      toast({
        variant: 'success',
        title: 'Product deleted successfully',
        description: `"${product.product_title}" has been removed from the system.`
      })
      
      dispatch(fetchProducts({ page, pageSize, search }))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete product',
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [dispatch, page, pageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  const columns: Array<Column<Product>> = useMemo(() => ([
    {
      key: 'product_title',
      header: 'Title',
      render: item => item.product_title,
      sortValue: item => item.product_title?.toLowerCase() || ''
    },
    {
      key: 'product_description',
      header: 'Description',
      render: item => item.product_description || '--',
      sortValue: item => item.product_description?.toLowerCase() || ''
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      render: item => (typeof item.unit_price === 'number' ? currencyFormatter.format(item.unit_price) : '--'),
      sortValue: item => (typeof item.unit_price === 'number' ? item.unit_price : Number.POSITIVE_INFINITY)
    },
    {
      key: 'category',
      header: 'Category',
      render: item => item.category?.category_name || '--',
      sortValue: item => item.category?.category_name?.toLowerCase() || ''
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: item => item.supplier?.supplier_name || '--',
      sortValue: item => item.supplier?.supplier_name?.toLowerCase() || ''
    }
  ]), [currencyFormatter])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Products</h2>
        <p className="text-sm text-gray-600">Inspect the product master list, including pricing and category assignments.</p>
      </div>

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
          pageSize={pageSize}
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
