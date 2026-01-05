'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDispatchOrders, deleteDispatchOrder, setPage, setPageSize } from '@/store/dispatchSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react'
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

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteDispatchOrder(deleteId))
      setDeleteId(null)
      dispatch(fetchDispatchOrders({ page, pageSize, search: searchQuery }))
    }
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
    dispatch(fetchDispatchOrders({ page, pageSize, search: searchQuery }))
  }

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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Dispatch
          </Button>
          <CardTitle>Dispatch Orders</CardTitle>
        </CardHeader>
        <CardContent>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispatch Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.dispatch_number}</TableCell>
                      <TableCell>{new Date(order.dispatch_date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customer_name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentBadge(order.payment_method)}</TableCell>
                      <TableCell className="text-right">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {order.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(order.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(order.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {items.length} of {total} orders
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => dispatch(setPage(page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => dispatch(setPage(page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
