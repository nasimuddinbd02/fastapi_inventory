"use client"

import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchIntakeOrders } from '@/store/intakeSlice'
import { fetchDispatchOrders } from '@/store/dispatchSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

type LedgerEntry = {
  id: string
  date: Date
  type: 'intake' | 'dispatch'
  reference: string
  product: string
  quantity: number
  status: string
  supplier?: string
}

type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'all'

const ITEMS_PER_PAGE = 10

export default function StockLedgerView() {
  const dispatch = useAppDispatch()
  const { items: intakeOrders, loading: intakeLoading } = useAppSelector((state) => state.intake)
  const { items: dispatchOrders, loading: dispatchLoading } = useAppSelector((state) => state.dispatch)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('month')
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoad(true)
      await Promise.all([
        dispatch(fetchIntakeOrders({ page: 1, pageSize: 1000 })),
        dispatch(fetchDispatchOrders({ page: 1, pageSize: 1000 }))
      ])
      setIsInitialLoad(false)
    }
    loadData()
  }, [dispatch])

  // Process and filter ledger entries
  const { filteredEntries, totalIntake, totalDispatch } = useMemo(() => {
    const entries: LedgerEntry[] = []

    // Process intake orders
    intakeOrders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          entries.push({
            id: `intake-${order.id}-${item.id}`,
            date: new Date(order.intake_date),
            type: 'intake',
            reference: order.intake_number,
            product: item.product_title || 'Unknown Product',
            quantity: item.quantity,
            status: order.status,
            supplier: order.supplier_name
          })
        })
      }
    })

    // Process dispatch orders
    dispatchOrders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          entries.push({
            id: `dispatch-${order.id}-${item.id}`,
            date: new Date(order.dispatch_date),
            type: 'dispatch',
            reference: order.dispatch_number,
            product: item.product_title || 'Unknown Product',
            quantity: item.quantity,
            status: order.status
          })
        })
      }
    })

    // Sort by date descending
    entries.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Apply date filter
    const now = new Date()
    const filtered = entries.filter((entry) => {
      switch (filterPeriod) {
        case 'today': {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          return entry.date >= today
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return entry.date >= weekAgo
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          return entry.date >= monthStart
        }
        case 'year': {
          const yearStart = new Date(now.getFullYear(), 0, 1)
          return entry.date >= yearStart
        }
        case 'all':
        default:
          return true
      }
    })

    // Calculate totals
    const intake = filtered
      .filter((e) => e.type === 'intake' && e.status === 'confirmed')
      .reduce((sum, e) => sum + e.quantity, 0)
    
    const dispatchTotal = filtered
      .filter((e) => e.type === 'dispatch' && e.status === 'completed')
      .reduce((sum, e) => sum + e.quantity, 0)

    return { filteredEntries: filtered, totalIntake: intake, totalDispatch: dispatchTotal }
  }, [intakeOrders, dispatchOrders, filterPeriod])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterPeriod])

  // Paginate the filtered entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredEntries.slice(startIndex, endIndex)
  }, [filteredEntries, currentPage])

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)

  const loading = intakeLoading || dispatchLoading || isInitialLoad

  const getTypeBadge = (type: 'intake' | 'dispatch') => {
    if (type === 'intake') {
      return (
        <Badge variant="default" className="bg-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          Intake
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-blue-600">
        <TrendingDown className="h-3 w-3 mr-1" />
        Dispatch
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-row items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Track all inventory movements in chronological order. Review intake and dispatch transactions to maintain accurate audit trails.</p>
        <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Intake</p>
                    <p className="text-2xl font-bold text-green-600">{totalIntake.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Dispatch</p>
                    <p className="text-2xl font-bold text-blue-600">{totalDispatch.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Movement</p>
                    <p className={`text-2xl font-bold ${totalIntake - totalDispatch >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(totalIntake - totalDispatch).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No transactions found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.date.toLocaleDateString()} {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>{getTypeBadge(entry.type)}</TableCell>
                          <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                          <TableCell>{entry.product}</TableCell>
                          <TableCell>{entry.supplier || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            <span className={entry.type === 'intake' ? 'text-green-600' : 'text-blue-600'}>
                              {entry.type === 'intake' ? '+' : '-'}{entry.quantity.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedEntries.length} of {filteredEntries.length} transactions
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
    </div>
  )
}
