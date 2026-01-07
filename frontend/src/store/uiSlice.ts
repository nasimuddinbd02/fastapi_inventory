import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ViewKey =
  | 'dashboard'
  | 'intake'
  | 'dispatch'
  | 'stock'
  | 'ledger'
  | 'masterdata'
  | 'masterdata.categories'
  | 'masterdata.suppliers'
  | 'masterdata.products'
  | 'masterdata.users'
  | 'ai.insights'
  | 'settings'

type UiState = {
  activeView: ViewKey
}

const initialState: UiState = {
  activeView: 'dashboard'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<ViewKey>) {
      state.activeView = action.payload
    }
  }
})

export const { setActiveView } = uiSlice.actions

export type { ViewKey }

export default uiSlice.reducer
