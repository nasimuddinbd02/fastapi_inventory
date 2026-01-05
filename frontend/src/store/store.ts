import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import uiReducer from './uiSlice'
import categoriesReducer from './categoriesSlice'
import productsReducer from './productsSlice'
import suppliersReducer from './suppliersSlice'
import usersReducer from './usersSlice'
import intakeReducer from './intakeSlice'
import dispatchReducer from './dispatchSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    categories: categoriesReducer,
    products: productsReducer,
    suppliers: suppliersReducer,
    users: usersReducer,
    intake: intakeReducer,
    dispatch: dispatchReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
