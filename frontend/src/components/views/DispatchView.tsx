'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDispatchOrders, deleteDispatchOrder, setPage, type DispatchOrder } from '@/store/dispatchSlice'
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
import DispatchForm from '@/components/forms/DispatchForm'

export default function DispatchView() {
  const dispatch = useAppDispatch()
  const { items, loading, total, page, pageSize } = useAppSelector((state) => state.dispatch)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchDispatchOrders({ page, pageSize, search: searchQuery }))
  }, [dispatch, page, pageSize])

  const handleSearch = () => {
    dispatch(setPage(1))
    dispatch(fetchDispatchOrders({ page: 1, pageSize, search: searchQuery }))
  }

  const handleDelete = useCallback(async (order: DispatchOrder) => {
    if (order.id) {
      setDeleteId(order.id)
    }
  }, [])

  const confirmDelete = async () => {
    if (deleteId) {
      await dispatch(deleteDispatchOrder(deleteId))
      setDeleteId(null)
      dispatch(fetchDispatchOrders({ page, pageSize, search: searchQuery }))
    }
  }

  const handleEdit = useCallback((order: DispatchOrder) => {
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
    dispatch(fetchDispatchOrders({ page, pageSize, search: searchQuery }))
  }

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>
  }

  const getPaymentBadge = (method: string | null) => {
    if (!method) return '-'
    return <Badge variant="secondary">{method.replace('_', ' ').toUpperCase()}</Badge>
  }

  const columns: Array<Column<DispatchOrder>> = useMemo(() => [
    {
      key: 'dispatch_number',
      header: 'Dispatch Number',
      render: (item) => <span className="font-medium">{item.dispatch_number}</span>,
      sortValue: (item) => item.dispatch_number || '',
      filterValue: (item) => item.dispatch_number || '',
      filterable: false
    },
    {
      key: 'dispatch_date',
      header: 'Date',
      render: (item) => new Date(item.dispatch_date).toLocaleDateString(),
      sortValue: (item) => item.dispatch_date || '',
      filterValue: (item) => new Date(item.dispatch_date).toLocaleDateString(),
      filterable: false
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (item) => item.customer_name || '-',
      sortValue: (item) => item.customer_name?.toLowerCase() || '',
      filterValue: (item) => item.customer_name || '',
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
      key: 'payment_method',
      header: 'Payment',
      render: (item) => getPaymentBadge(item.payment_method),
      sortValue: (item) => item.payment_method || '',
      filterValue: (item) => item.payment_method || '',
      filterable: false
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (item) => <div className="text-center">${Number.parseFloat(item.total_amount.toString()).toFixed(2)}</div>,
      sortValue: (item) => Number.parseFloat(item.total_amount.toString()),
      filterValue: (item) => item.total_amount.toString(),
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
      <p className="text-sm text-muted-foreground">Process outgoing inventory to customers. Create dispatch orders to track shipments and automatically deduct from stock levels.</p>
      
      <div className="flex flex-row items-center justify-start mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Dispatch
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by dispatch number, customer..."
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
        <DataTable<DispatchOrder>
          data={items}
          columns={columns}
          emptyMessage="No dispatch orders found"
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
        <DispatchForm
          isOpen={showForm}
          onClose={handleFormClose}
          editingId={editingId}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dispatch Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dispatch order? This action cannot be undone.
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
