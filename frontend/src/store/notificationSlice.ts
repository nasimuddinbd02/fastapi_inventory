import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from './store' 

export interface NotificationItem {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
  resource_type?: string
  resource_id?: number
}

interface NotificationState {
  items: NotificationItem[]
  loading: boolean
}

const initialState: NotificationState = {
  items: [],
  loading: false
}

export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (_, { getState }) => {
        const token = (getState() as RootState).auth.token?.access_token
        const response = await axios.get('http://localhost:8000/v1/notifications/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }
)

export const markRead = createAsyncThunk(
    'notifications/markRead',
    async (id: number, { getState }) => {
        const token = (getState() as RootState).auth.token?.access_token
        await axios.put(`http://localhost:8000/v1/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return id
    }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Add new notification to top
      state.items.unshift(action.payload)
    },
    markAllReadLocal: (state) => {
        state.items.forEach(i => i.is_read = true)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload
    })
    builder.addCase(markRead.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload)
        if (item) item.is_read = true
    })
  }
})

export const { addNotification, markAllReadLocal } = notificationSlice.actions
export default notificationSlice.reducer
