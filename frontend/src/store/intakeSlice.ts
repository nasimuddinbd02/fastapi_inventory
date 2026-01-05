import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type IntakeItem = {
  id?: number
  product_id: number
  product_title?: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export type IntakeOrder = {
  id: number
  intake_number: string
  intake_date: string
  supplier_id?: number | null
  supplier_name?: string | null
  status: 'draft' | 'confirmed' | 'cancelled'
  total_cost: number
  notes?: string | null
  items: IntakeItem[]
  created_at: string
  updated_at: string
}

type IntakeState = {
  items: IntakeOrder[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: IntakeState = {
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

export const fetchIntakeOrders = createAsyncThunk(
  'intake/fetchIntakeOrders',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('q', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.INTAKE)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createIntakeOrder = createAsyncThunk(
  'intake/createIntakeOrder',
  async (data: {
    intake_date?: string
    supplier_id?: number | null
    status?: string
    notes?: string | null
    items: Array<{ product_id: number; quantity: number; unit_cost: number }>
  }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.INTAKE), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateIntakeOrder = createAsyncThunk(
  'intake/updateIntakeOrder',
  async ({ id, data }: {
    id: number
    data: {
      intake_date?: string
      supplier_id?: number | null
      status?: string
      notes?: string | null
      items?: Array<{ product_id: number; quantity: number; unit_cost: number }>
    }
  }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.INTAKE)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteIntakeOrder = createAsyncThunk(
  'intake/deleteIntakeOrder',
  async (id: number) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.INTAKE)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const intakeSlice = createSlice({
  name: 'intake',
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
      .addCase(fetchIntakeOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIntakeOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
        state.page = action.payload.page || 1
        state.pageSize = action.payload.page_size || DEFAULT_PAGE_SIZE
      })
      .addCase(fetchIntakeOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch intake orders'
      })
      .addCase(createIntakeOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateIntakeOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteIntakeOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = intakeSlice.actions
export default intakeSlice.reducer
