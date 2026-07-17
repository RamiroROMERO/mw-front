import { createSlice } from '@reduxjs/toolkit';
import {
  defaultMenuType,
  subHiddenBreakpoint,
  menuHiddenBreakpoint,
} from '@/constants/defaultValues';
import {
  MENU_SET_CLASSNAMES,
  MENU_CONTAINER_ADD_CLASSNAME,
  MENU_CLICK_MOBILE_MENU,
  MENU_CHANGE_DEFAULT_CLASSES,
  MENU_CHANGE_HAS_SUB_ITEM_STATUS,
} from '../contants';

const initialState = {
  containerClassnames: defaultMenuType,
  subHiddenBreakpoint,
  menuHiddenBreakpoint,
  menuClickCount: 0,
  selectedMenuHasSubItems: defaultMenuType === 'menu-default', // if you use menu-sub-hidden as default menu type, set value of this variable to false
};

// Mismos action types que src/redux/menu/actions.js ya despacha — solo se
// reemplaza el switch por createSlice (Immer), sin cambiar ningún type.
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(MENU_CHANGE_HAS_SUB_ITEM_STATUS, (state, action) => {
        state.selectedMenuHasSubItems = action.payload;
      })
      .addCase(MENU_SET_CLASSNAMES, (state, action) => {
        state.containerClassnames = action.payload.containerClassnames;
        state.menuClickCount = action.payload.menuClickCount;
      })
      .addCase(MENU_CLICK_MOBILE_MENU, (state, action) => {
        state.containerClassnames = action.payload.containerClassnames;
        state.menuClickCount = action.payload.menuClickCount;
      })
      .addCase(MENU_CONTAINER_ADD_CLASSNAME, (state, action) => {
        state.containerClassnames = action.payload;
      })
      .addCase(MENU_CHANGE_DEFAULT_CLASSES, (state, action) => {
        state.containerClassnames = action.payload;
      });
  },
});

export default menuSlice.reducer;
