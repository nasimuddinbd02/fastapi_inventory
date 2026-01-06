'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchIntakeOrders, deleteIntakeOrder, setPage, type IntakeOrder } from '@/store/intakeSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/views/masterData/shared'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Pencil, Search, Eye } from 'lucide-react'
import IntakeForm from '@/components/forms/IntakeForm'

export default function IntakeView() {
  const dispatch = useAppDispatch()
  const { items, loading, total, page, pageSize } = useAppSelector((state) => state.intake)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchIntakeOrders({ page, pageSize, search: searchQuery }))
  }, [dispatch, page, pageSize])

  const handleSearch = () => {
    dispatch(setPage(1))
    dispatch(fetchIntakeOrders({ page: 1, pageSize, search: searchQuery }))
  }

  const handleDelete = useCallback(async (order: IntakeOrder) => {
    if (order.id) {
      setDeleteId(order.id)
    }
  }, [])

  const confirmDelete = async () => {
    if (deleteId) {
      await dispatch(deleteIntakeOrder(deleteId))
      setDeleteId(null)
      dispatch(fetchIntakeOrders({ page, pageSize, search: searchQuery }))
    }
  }

  const handleEdit = useCallback((order: IntakeOrder) => {
    setEditingId(order.id)
    setShowForm(true)
  }, [])

  const handleCreate = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    dispatch(fetchIntakeOrders({ page, pageSize, search: searchQuery }))
  }

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      confirmed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>
  }

  const columns: Array<Column<IntakeOrder>> = useMemo(() => [
    {
      key: 'intake_number',
      header: 'Intake Number',
      render: (item) => <span className="font-medium">{item.intake_number}</span>,
      sortValue: (item) => item.intake_number || '',
      filterValue: (item) => item.intake_number || '',
      filterable: false
    },
    {
      key: 'intake_date',
      header: 'Date',
      render: (item) => new Date(item.intake_date).toLocaleDateString(),
      sortValue: (item) => item.intake_date || '',
      filterValue: (item) => new Date(item.intake_date).toLocaleDateString(),
      filterable: false
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (item) => item.supplier_name || '-',
      sortValue: (item) => item.supplier_name?.toLowerCase() || '',
      filterValue: (item) => item.supplier_name || '',
      filterable: false
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => getStatusBadge(item.status),
      sortValue: (item) => item.status || '',
      filterValue: (item) => item.status || '',
      filterable: false
    },
    {
      key: 'total_cost',
      header: 'Total Cost',
      render: (item) => <div className="text-center">${Number.parseFloat(item.total_cost.toString()).toFixed(2)}</div>,
      sortValue: (item) => Number.parseFloat(item.total_cost.toString()),
      filterValue: (item) => item.total_cost.toString(),
      filterable: false
    },
    {
      key: 'items',
      header: 'Items',
      render: (item) => item.items?.length || 0,
      sortValue: (item) => item.items?.length || 0,
      filterable: false
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="text-right space-x-2">
          {item.status === 'draft' ? (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="View order">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      filterable: false
    }
  ], [handleEdit])

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">Record incoming inventory from suppliers. Create intake orders to track received goods and update stock levels automatically.</p>
      
      <div className="flex flex-row items-center justify-start mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Intake
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by intake number, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DataTable<IntakeOrder>
          data={items}
          columns={columns}
          emptyMessage="No intake orders found"
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onDelete={item => item.status === 'draft' ? handleDelete(item) : undefined}
          onRowDoubleClick={handleEdit}
        />
      )}

      {showForm && (
        <IntakeForm
          isOpen={showForm}
          onClose={handleFormClose}
          editingId={editingId}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intake Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this intake order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
