"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { toastSuccess, toastError } from '@/lib/toast-messages'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { SupplierForm } from '@/components/forms/SupplierForm'
import { fetchSuppliers, deleteSupplier, setPage, type Supplier } from '@/store/suppliersSlice'
import { selectSettings } from '@/store/settingsSlice'

const columns: Array<Column<Supplier>> = [
  {
    key: 'supplier_name',
    header: 'Name',
    render: item => item.supplier_name,
    sortValue: item => item.supplier_name?.toLowerCase() || '',
    filterValue: item => item.supplier_name || ''
  },
  {
    key: 'contact_email',
    header: 'Email',
    render: item => item.contact_email || '--',
    sortValue: item => item.contact_email?.toLowerCase() || '',
    filterValue: item => item.contact_email || ''
  },
  {
    key: 'contact_info',
    header: 'Contact Info',
    render: item => item.contact_info || '--',
    sortValue: item => item.contact_info?.toLowerCase() || '',
    filterValue: item => item.contact_info || ''
  },
  {
    key: 'created_at',
    header: 'Created',
    render: item => item.created_at || '--',
    sortValue: item => item.created_at || '',
    filterValue: item => item.created_at || ''
  }
]

export default function SettingsSuppliersView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.suppliers)
  const settings = useAppSelector(selectSettings)
  const effectivePageSize = settings.items_per_page || pageSize

  useEffect(() => {
    dispatch(fetchSuppliers({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

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
    dispatch(fetchSuppliers({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleDelete = useCallback(async (supplier: Supplier)=>{
    if (!supplier.id) return
    
    try {
      await dispatch(deleteSupplier(supplier.id)).unwrap()
      
      toastSuccess.deleted('Supplier', supplier.supplier_name)
      
      dispatch(fetchSuppliers({ page, pageSize: effectivePageSize, search }))
    } catch (error) {
      toastError.deleteFailed(error instanceof Error ? error.message : 'supplier')
      throw error
    }
  }, [dispatch, page, effectivePageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8 pt-4">
      <p className="text-sm text-muted-foreground">Maintain your supplier directory with contact details and business information. Keep your procurement network organized and up-to-date.</p>

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
          pageSize={effectivePageSize}
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
