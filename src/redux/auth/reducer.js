import { createSlice } from '@reduxjs/toolkit';
import { getCurrentUser } from '@/helpers/Utils';
import { isAuthGuardActive, currentUser } from '@/constants/defaultValues';
import {
  LOGIN_USER,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  REGISTER_USER,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
  LOGOUT_USER,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ERROR,
  RESET_PASSWORD,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
} from '../contants';

const initialState = {
  currentUser: isAuthGuardActive ? currentUser : getCurrentUser(),
  forgotUserMail: '',
  newPassword: '',
  resetPasswordCode: '',
  loading: false,
  error: '',
};

// extraReducers usa los mismos string constants que ya consume la saga
// (src/redux/auth/saga.js, takeEvery(LOGIN_USER, ...)) y los action creators
// existentes (src/redux/auth/actions.js) — no cambia ningún type ni firma,
// solo la implementación del reducer (switch -> Immer vía createSlice).
const authSlice = createSlice({
  name: 'authUser',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(LOGIN_USER, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(LOGIN_USER_SUCCESS, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = '';
      })
      .addCase(LOGIN_USER_ERROR, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload.message;
      })
      .addCase(FORGOT_PASSWORD, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(FORGOT_PASSWORD_SUCCESS, (state, action) => {
        state.loading = false;
        state.forgotUserMail = action.payload;
        state.error = '';
      })
      .addCase(FORGOT_PASSWORD_ERROR, (state, action) => {
        state.loading = false;
        state.forgotUserMail = '';
        state.error = action.payload.message;
      })
      .addCase(RESET_PASSWORD, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(RESET_PASSWORD_SUCCESS, (state, action) => {
        state.loading = false;
        state.newPassword = action.payload;
        state.resetPasswordCode = '';
        state.error = '';
      })
      .addCase(RESET_PASSWORD_ERROR, (state, action) => {
        state.loading = false;
        state.newPassword = '';
        state.resetPasswordCode = '';
        state.error = action.payload.message;
      })
      .addCase(REGISTER_USER, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(REGISTER_USER_SUCCESS, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = '';
      })
      .addCase(REGISTER_USER_ERROR, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload.message;
      })
      .addCase(LOGOUT_USER, (state) => {
        state.currentUser = null;
        state.error = '';
      });
  },
});

export default authSlice.reducer;
