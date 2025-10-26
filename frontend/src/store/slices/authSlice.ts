import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types';
import { authApi } from '../api/authApi';

const initialState: AuthState = {
  user: null,
  sessionId: localStorage.getItem('sessionId'),
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; sessionId: string }>) => {
      const { user, sessionId } = action.payload;
      state.user = user;
      state.sessionId = sessionId;
      state.isAuthenticated = true;
      localStorage.setItem('sessionId', sessionId);
    },
    
    clearCredentials: (state) => {
      state.user = null;
      state.sessionId = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sessionId');
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const { user, sessionId } = action.payload.data;
          state.user = user;
          state.sessionId = sessionId;
          state.isAuthenticated = true;
          localStorage.setItem('sessionId', sessionId);
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const { user, sessionId } = action.payload.data;
          state.user = user;
          state.sessionId = sessionId;
          state.isAuthenticated = true;
          localStorage.setItem('sessionId', sessionId);
        }
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.sessionId = null;
        state.isAuthenticated = false;
        localStorage.removeItem('sessionId');
      });
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;