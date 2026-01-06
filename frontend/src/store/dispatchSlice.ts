import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type DispatchItem = {
  id?: number
  product_id: number
  product_title?: string
  quantity: number
  unit_price: number
  total_price: number
}

export type DispatchOrder = {
  id: number
  dispatch_number: string
  dispatch_date: string
  customer_name?: string | null
  status: 'draft' | 'completed' | 'cancelled'
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | null
  notes?: string | null
  items: DispatchItem[]
  created_at: string
  updated_at: string
}

type DispatchState = {
  items: DispatchOrder[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: DispatchState = {
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

export const fetchDispatchOrders = createAsyncThunk(
  'dispatch/fetchDispatchOrders',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('q', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.DISPATCH)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createDispatchOrder = createAsyncThunk(
  'dispatch/createDispatchOrder',
  async (data: {
    dispatch_date?: string
    customer_name?: string | null
    payment_method?: string | null
    notes?: string | null
    status?: string
    items: Array<{ product_id: number; quantity: number; unit_price: number }>
    tax_rate?: number
  }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.DISPATCH), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateDispatchOrder = createAsyncThunk(
  'dispatch/updateDispatchOrder',
  async ({ id, data }: {
    id: number
    data: {
      dispatch_date?: string
      customer_name?: string | null
      status?: string
      payment_method?: string | null
      notes?: string | null
      items?: Array<{ product_id: number; quantity: number; unit_price: number }>
      tax_rate?: number
    }
  }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.DISPATCH)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteDispatchOrder = createAsyncThunk(
  'dispatch/deleteDispatchOrder',
  async (id: number) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.DISPATCH)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const dispatchSlice = createSlice({
  name: 'dispatch',
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
      .addCase(fetchDispatchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDispatchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
        state.page = action.payload.page || 1
        state.pageSize = action.payload.page_size || DEFAULT_PAGE_SIZE
      })
      .addCase(fetchDispatchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dispatch orders'
      })
      .addCase(createDispatchOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateDispatchOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteDispatchOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = dispatchSlice.actions
export default dispatchSlice.reducer
