import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { DEFAULT_PAGE_SIZE } from '@/config/app'

export type Category = {
  id?: number | string
  category_name: string
  category_description?: string | null
  created_at?: string | null
}

type CategoriesState = {
  items: Category[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: CategoriesState = {
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

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const token = getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) {
      params.append('search', search)
    }
    const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.CATEGORIES)}?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data: { category_name: string; category_description?: string | null }) => {
    const token = getAuthToken()
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.CATEGORIES), data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: number | string; data: { category_name: string; category_description?: string | null } }) => {
    const token = getAuthToken()
    const response = await axios.put(`${buildApiUrl(API_ENDPOINTS.CATEGORIES)}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number | string) => {
    const token = getAuthToken()
    await axios.delete(`${buildApiUrl(API_ENDPOINTS.CATEGORIES)}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return id
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
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
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch categories'
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
        state.total -= 1
      })
  }
})

export const { setPage, setPageSize } = categoriesSlice.actions
export default categoriesSlice.reducer
