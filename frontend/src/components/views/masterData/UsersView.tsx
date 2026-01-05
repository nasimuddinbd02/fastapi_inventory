"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from './shared'
import { UserForm } from '@/components/forms/UserForm'
import { fetchUsers, deleteUser, setPage, type User } from '@/store/usersSlice'

const columns: Array<Column<User>> = [
  {
    key: 'login_name',
    header: 'Login',
    render: item => item.login_name,
    sortValue: item => item.login_name?.toLowerCase() || ''
  },
  {
    key: 'display_name',
    header: 'Display Name',
    render: item => item.display_name || '--',
    sortValue: item => item.display_name?.toLowerCase() || ''
  },
  {
    key: 'email_address',
    header: 'Email',
    render: item => item.email_address || '--',
    sortValue: item => item.email_address?.toLowerCase() || ''
  },
  {
    key: 'is_active',
    header: 'Status',
    render: item => (item.is_active ? 'Active' : 'Inactive'),
    sortValue: item => (item.is_active ? 1 : 0)
  },
  {
    key: 'account_created',
    header: 'Created',
    render: item => item.account_created || '--',
    sortValue: item => item.account_created || ''
  }
]

export default function SettingsUsersView(){
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const dispatch = useAppDispatch()
  const { items, loading, error, total, page, pageSize } = useAppSelector(state => state.users)

  useEffect(() => {
    dispatch(fetchUsers({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

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
    dispatch(fetchUsers({ page, pageSize, search }))
  }, [dispatch, page, pageSize, search])

  const handleDelete = useCallback(async (user: User)=>{
    if (!user.id) return
    
    try {
      await dispatch(deleteUser(user.id)).unwrap()
      
      toast({
        variant: 'success',
        title: 'User deleted successfully',
        description: `"${user.login_name}" has been removed from the system.`
      })
      
      dispatch(fetchUsers({ page, pageSize, search }))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete user',
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
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-gray-600">Manage user accounts and verify account activity status.</p>
      </div>

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
          pageSize={pageSize}
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
