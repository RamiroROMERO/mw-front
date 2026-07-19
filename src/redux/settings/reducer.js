import { createSlice } from '@reduxjs/toolkit';
import { getCurrentLanguage } from '@Helpers/Utils';
import { CHANGE_LOCALE } from '../constants';

const initialState = {
  locale: getCurrentLanguage(),
};

// Mismo action type que src/redux/settings/actions.js ya despacha.
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(CHANGE_LOCALE, (state, action) => {
      state.locale = action.payload;
    });
  },
});

export default settingsSlice.reducer;
