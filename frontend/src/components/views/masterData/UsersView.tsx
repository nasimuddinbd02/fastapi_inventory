"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { toastSuccess, toastError } from '@/lib/toast-messages'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { UserForm } from '@/components/forms/UserForm'
import { fetchUsers, deleteUser, setPage, type User } from '@/store/usersSlice'
import { selectSettings } from '@/store/settingsSlice'

const columns: Array<Column<User>> = [
  {
    key: 'login_name',
    header: 'Login',
    render: item => item.login_name,
    sortValue: item => item.login_name?.toLowerCase() || '',
    filterValue: item => item.login_name || ''
  },
  {
    key: 'display_name',
    header: 'Display Name',
    render: item => item.display_name || '--',
    sortValue: item => item.display_name?.toLowerCase() || '',
    filterValue: item => item.display_name || ''
  },
  {
    key: 'email_address',
    header: 'Email',
    render: item => item.email_address || '--',
    sortValue: item => item.email_address?.toLowerCase() || '',
    filterValue: item => item.email_address || ''
  },
  {
    key: 'is_active',
    header: 'Status',
    render: item => (item.is_active ? 'Active' : 'Inactive'),
    sortValue: item => (item.is_active ? 1 : 0),
    filterValue: item => (item.is_active ? 'Active' : 'Inactive')
  },
  {
    key: 'account_created',
    header: 'Created',
    render: item => item.account_created || '--',
    sortValue: item => item.account_created || '',
    filterValue: item => item.account_created || ''
  }
]

export default function SettingsUsersView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.users)
  const settings = useAppSelector(selectSettings)
  const effectivePageSize = settings.items_per_page || pageSize

  useEffect(() => {
    dispatch(fetchUsers({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleAdd = useCallback(()=>{
    setEditingUser(null)
    setShowAddForm(true)
  }, [])

  const handleEdit = useCallback((user: User)=>{
    setEditingUser(user)
    setShowAddForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false)
    setEditingUser(null)
    dispatch(fetchUsers({ page, pageSize: effectivePageSize, search }))
  }, [dispatch, page, effectivePageSize, search])

  const handleDelete = useCallback(async (user: User)=>{
    if (!user.id) return
    
    try {
      await dispatch(deleteUser(user.id)).unwrap()
      
      toastSuccess.deleted('User', user.login_name)
      
      dispatch(fetchUsers({ page, pageSize: effectivePageSize, search }))
    } catch (error) {
      toastError.deleteFailed(error instanceof Error ? error.message : 'user')
      throw error
    }
  }, [dispatch, page, effectivePageSize, search])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  return (
    <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8 pt-4">
      <p className="text-sm text-muted-foreground">Control system access by managing user accounts. Add new users, update permissions, and monitor account activity.</p>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleAdd} className="w-fit">
              <Plus />
              Add User
            </Button>
            <span className="text-xs text-gray-500">{loading ? 'Loading users...' : `Total: ${total}`}</span>
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
            placeholder="Search users..."
            aria-label="Search users"
            disabled={!!error}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <DataTable<User>
          data={items}
          columns={columns}
          emptyMessage="No users found."
          loading={loading}
          page={page}
          pageSize={effectivePageSize}
          total={total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onRowDoubleClick={handleEdit}
        />
      )}

      <UserForm 
        open={showAddForm} 
        onOpenChange={handleCloseForm}
        editData={editingUser}
      />
    </div>
  )
}
