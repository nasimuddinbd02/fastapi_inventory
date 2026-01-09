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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Intake Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage incoming inventory, track shipments, and update stock levels.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Intake
        </Button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg border flex items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
             <Pencil className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Draft Orders</p>
            <h3 className="text-2xl font-bold">{items.filter(i => i.status === 'draft').length}</h3>
          </div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border flex items-center gap-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
             <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            <h3 className="text-2xl font-bold">{items.filter(i => i.status === 'confirmed').length}</h3>
          </div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border flex items-center gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
             <Search className="w-5 h-5" />
          </div>
          <div>
             <p className="text-sm font-medium text-muted-foreground">Total Records</p>
             <h3 className="text-2xl font-bold">{total}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search intakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 bg-background border-none shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <Button variant="ghost" size="sm" onClick={handleSearch}>Refresh</Button>
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
