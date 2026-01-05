"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { SupplierForm } from '@/components/forms/SupplierForm'
import { fetchSuppliers, deleteSupplier, setPage, type Supplier } from '@/store/suppliersSlice'

const columns: Array<Column<Supplier>> = [
  {
    key: 'supplier_name',
    header: 'Name',
    render: item => item.supplier_name,
    sortValue: item => item.supplier_name?.toLowerCase() || ''
  },
  {
    key: 'contact_email',
    header: 'Email',
    render: item => item.contact_email || '--',
    sortValue: item => item.contact_email?.toLowerCase() || ''
  },
  {
    key: 'contact_info',
    header: 'Contact Info',
    render: item => item.contact_info || '--',
    sortValue: item => item.contact_info?.toLowerCase() || ''
  },
  {
    key: 'created_at',
    header: 'Created',
    render: item => item.created_at || '--',
    sortValue: item => item.created_at || ''
  }
]

export default function SettingsSuppliersView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.suppliers)

  useEffect(() => {
    dispatch(fetchSuppliers({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

  const handleAdd = useCallback(()=>{
    setEditingSupplier(null)
    setShowAddForm(true)
  }, [])

  const handleEdit = useCallback((supplier: Supplier)=>{
    setEditingSupplier(supplier)
    setShowAddForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false)
    setEditingSupplier(null)
    dispatch(fetchSuppliers({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

  const handleDelete = useCallback(async (supplier: Supplier)=>{
    if (!supplier.id) return
    
    try {
      await dispatch(deleteSupplier(supplier.id)).unwrap()
      
      toast({
        variant: 'success',
        title: 'Supplier deleted successfully',
        description: `"${supplier.supplier_name}" has been removed from the system.`
      })
      
      dispatch(fetchSuppliers({ page, pageSize, search }))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete supplier',
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [dispatch, page, pageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Suppliers</h2>
        <p className="text-sm text-gray-600">Review supplier details to keep procurement information current.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleAdd} className="w-fit">
              <Plus />
              Add Supplier
            </Button>
            <span className="text-xs text-gray-500">{loading ? 'Loading suppliers...' : `Total: ${total}`}</span>
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
            placeholder="Search suppliers..."
            aria-label="Search suppliers"
            disabled={!!error}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <DataTable<Supplier>
          data={items}
          columns={columns}
          emptyMessage="No suppliers found."
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onRowDoubleClick={handleEdit}
        />
      )}

      <SupplierForm 
        open={showAddForm} 
        onOpenChange={handleCloseForm}
        editData={editingSupplier}
      />
    </div>
  )
}
