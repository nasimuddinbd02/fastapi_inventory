import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type User = {
  id?: number | string
  login_name: string
  email_address?: string | null
  display_name?: string | null
  is_active?: boolean
  account_created?: string | null
  last_updated?: string | null
}

type UsersState = {
  items: User[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE
}

const getAuthToken = () => {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
  return token
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('search', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.USERS)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: { login_name: string; email_address: string; display_name?: string | null; password: string; confirm_password: string; accept_terms: boolean }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.USERS), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: number | string; data: { login_name: string; email_address: string; display_name?: string | null; password?: string; confirm_password?: string } }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.USERS)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number | string) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.USERS)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch users'
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = usersSlice.actions
export default usersSlice.reducer
