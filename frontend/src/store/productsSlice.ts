import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type Product = {
  id?: number | string
  product_title: string
  product_description?: string | null
  unit_price?: number | null
  category?: { category_name?: string | null } | null
  supplier?: { supplier_name?: string | null } | null
  created_at?: string | null
}

type ProductsState = {
  items: Product[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: ProductsState = {
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

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('search', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.PRODUCTS)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: { product_title: string; product_description?: string | null; unit_price: number; category_name: string; supplier_name: string }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.PRODUCTS), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: number | string; data: { product_title: string; product_description?: string | null; unit_price: number; category_name: string; supplier_name: string } }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.PRODUCTS)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number | string) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.PRODUCTS)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const productsSlice = createSlice({
  name: 'products',
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
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = productsSlice.actions
export default productsSlice.reducer
