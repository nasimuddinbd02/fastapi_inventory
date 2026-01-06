"use client"

import React, { useMemo, useState } from 'react'
import { Trash2, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

// Note: useMasterDataList hook removed - all views now use Redux Toolkit for state management

export type Column<T> = {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  sortValue?: (item: T) => string | number | boolean | null | undefined
  filterValue?: (item: T) => string
  filterable?: boolean
}

type DataTableProps<T> = {
  data: T[]
  columns: Array<Column<T>>
  emptyMessage: string
  loading?: boolean
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onDelete?: (item: T) => void | Promise<void>
  onRowDoubleClick?: (item: T) => void
}

// Note: useMasterDataList hook removed - all views now use Redux Toolkit for state management

type SortDirection = 'asc' | 'desc'

export function DataTable<T>({
  data,
  columns,
  emptyMessage,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  onRowDoubleClick
}: DataTableProps<T>){
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  const sortableColumns = useMemo(()=>{
    return new Map(columns.map(column => [column.key, column]))
  }, [columns])

  const activeColumn = useMemo(()=>{
    if (!sortKey) return null
    const column = sortableColumns.get(sortKey)
    return column && column.sortValue ? column : null
  }, [sortKey, sortableColumns])

  const colSpan = useMemo(()=> Math.max(columns.length + (onDelete ? 1 : 0), 1), [columns.length, onDelete])

  // Filter data first
  const filteredData = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return data
    
    return data.filter(item => {
      return Object.entries(columnFilters).every(([columnKey, filterText]) => {
        if (!filterText) return true
        
        const column = columns.find(col => col.key === columnKey)
        if (!column?.filterValue) return true
        
        const itemValue = column.filterValue(item)
        return itemValue.toLowerCase().includes(filterText.toLowerCase())
      })
    })
  }, [data, columnFilters, columns])

  const sortedData = useMemo(()=>{
    if (!activeColumn?.sortValue) return filteredData
    const extractor = activeColumn.sortValue
    const direction = sortDirection === 'asc' ? 1 : -1
    return [...filteredData].sort((a, b) => {
      const aValue = extractor(a)
      const bValue = extractor(b)

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1 * direction
      if (bValue == null) return -1 * direction

      if (typeof aValue === 'number' && typeof bValue === 'number'){
        if (aValue === bValue) return 0
        return aValue > bValue ? direction : -direction
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean'){
        if (aValue === bValue) return 0
        return aValue ? direction : -direction
      }

      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()
      return aString.localeCompare(bString) * direction
    })
  }, [activeColumn, filteredData, sortDirection])

  function handleSort(column: Column<T>){
    if (!column.sortValue) return
    if (sortKey === column.key){
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column.key)
      setSortDirection('asc')
    }
  }

  function handleFilterChange(columnKey: string, value: string) {
    setColumnFilters(prev => {
      if (!value) {
        const newFilters = { ...prev }
        delete newFilters[columnKey]
        return newFilters
      }
      return { ...prev, [columnKey]: value }
    })
  }

  function clearAllFilters() {
    setColumnFilters({})
  }

  const hasActiveFilters = Object.keys(columnFilters).length > 0

  function promptDelete(item: T){
    if (!onDelete) return
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  async function confirmDelete(){
    if (!onDelete || !itemToDelete) return
    const candidate = itemToDelete as { id?: number | string }
    const itemId = candidate?.id
    if (!itemId) return

    setShowDeleteDialog(false)
    setDeletingId(itemId)
    try {
      await onDelete(itemToDelete)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeletingId(null)
      setItemToDelete(null)
    }
  }

  function cancelDelete(){
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  const showPagination = typeof onPageChange === 'function' && typeof page === 'number' && typeof pageSize === 'number' && typeof total === 'number'
  let totalPages = 1
  let currentPage = 1
  if (showPagination){
    const safeTotal = Math.max(total ?? 0, 0)
    const safePageSize = Math.max(pageSize ?? 1, 1)
    totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize))
    currentPage = Math.min(Math.max(page ?? 1, 1), totalPages)
  }

  function goToPage(target: number){
    if (!showPagination || !onPageChange) return
    const clamped = Math.max(1, Math.min(target, totalPages))
    if (clamped !== currentPage){
      onPageChange(clamped)
    }
  }

  const paginationItems = useMemo(()=>{
    if (!showPagination) return [] as Array<number | 'ellipsis'>
    if (totalPages <= 5){
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    const pages: Array<number | 'ellipsis'> = [1]
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    if (start > 2){
      pages.push('ellipsis')
    }
    for (let pageNumber = start; pageNumber <= end; pageNumber += 1){
      pages.push(pageNumber)
    }
    if (end < totalPages - 1){
      pages.push('ellipsis')
    }
    pages.push(totalPages)
    return pages
  }, [showPagination, totalPages, currentPage])

  const disablePrev = loading || currentPage <= 1
  const disableNext = loading || currentPage >= totalPages

  // Check if any column is filterable
  const hasFilterableColumns = columns.some(col => col.filterable)

  return (
    <div className="w-full overflow-hidden rounded-md border">
      {/* Filter Toggle Button - only show if there are filterable columns */}
      {hasFilterableColumns && (
        <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(prev => !prev)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters ({Object.keys(columnFilters).length})
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground">
              Showing {sortedData.length} of {data.length} items
            </span>
          )}
        </div>
      )}

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column.key}>
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={()=>handleSort(column)}
                    className="flex items-center gap-1 text-left font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>{column.header}</span>
                    <span aria-hidden="true" className="text-[0.65rem]">
                      {sortKey === column.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                    <span className="sr-only">{`Sort by ${column.header}`}</span>
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {onDelete && (
              <TableHead className="w-16 text-right">Actions</TableHead>
            )}
          </TableRow>
          {/* Filter Row */}
          {showFilters && (
            <TableRow className="bg-muted/30">
              {columns.map(column => (
                <TableHead key={`filter-${column.key}`} className="py-2">
                  {(column.filterable !== false && column.filterValue) ? (
                    <Input
                      placeholder={`Filter ${column.header}...`}
                      value={columnFilters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : null}
                </TableHead>
              ))}
              {onDelete && <TableHead className="py-2" />}
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item, index) => {
              const candidate = item as { id?: number | string }
              const rowKey = candidate?.id !== undefined ? String(candidate.id) : `row-${index}`
              const itemId = candidate?.id
              const isDeleting = itemId !== undefined && deletingId === itemId
              return (
                <TableRow 
                  key={rowKey}
                  onDoubleClick={() => onRowDoubleClick?.(item)}
                  className={onRowDoubleClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {columns.map(column => (
                    <TableCell key={column.key}>{column.render(item)}</TableCell>
                  ))}
                  {onDelete && (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => promptDelete(item)}
                        disabled={isDeleting || loading}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {showPagination && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {sortedData.length} of {total} items
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={disablePrev}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={disableNext}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
