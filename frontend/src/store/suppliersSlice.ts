import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type Supplier = {
  id?: number | string
  supplier_name: string
  contact_email?: string | null
  contact_info?: string | null
  created_at?: string | null
}

type SuppliersState = {
  items: Supplier[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: SuppliersState = {
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

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('search', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.SUPPLIERS)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (data: { supplier_name: string; contact_email: string; contact_info?: string | null }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.SUPPLIERS), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, data }: { id: number | string; data: { supplier_name: string; contact_email: string; contact_info?: string | null } }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.SUPPLIERS)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id: number | string) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.SUPPLIERS)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const suppliersSlice = createSlice({
  name: 'suppliers',
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
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch suppliers'
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = suppliersSlice.actions
export default suppliersSlice.reducer
