import { createSlice } from '@reduxjs/toolkit';
import { adminRoot } from "@/constants/defaultValues"

const initialState = {
  screenTitle: "menu.app",
  breadCrumbPath: `${adminRoot}/`,
  companyData: {
    name: "Hiperlimpieza"
  },
  moduleId: 0,
  userData: {
    uId: 0,
    name: null,
    email: null,
    accessData: []
  }
}

// Mismos action types (strings literales) que src/redux/generalData/actions.js
// ya despacha vía thunk. EDIT_COMPANY_DATA/EDIT_MODULE_ID no tienen action
// creator en actions.js (no se despachan desde ningún lado hoy) pero se
// conservan para no cambiar el comportamiento del reducer original.
const generalDataSlice = createSlice({
  name: 'generalData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase('EDIT_SCREEN_TITLE', (state, action) => {
        state.screenTitle = action.payload;
      })
      .addCase('EDIT_BREAD_CRUMB_PATH', (state, action) => {
        state.breadCrumbPath = action.payload;
      })
      .addCase('EDIT_COMPANY_DATA', (state, action) => {
        state.companyData = action.payload;
      })
      .addCase('EDIT_USER_DATA', (state, action) => {
        state.userData = action.payload;
      })
      .addCase('EDIT_MODULE_ID', (state, action) => {
        state.moduleId = action.payload;
      });
  },
});

export default generalDataSlice.reducer;
