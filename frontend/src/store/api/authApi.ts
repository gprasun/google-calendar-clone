import { baseApi } from './baseApi';
import type { User, AuthResponse, ApiResponse } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<ApiResponse<AuthResponse>, { name: string; email: string; password: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    logout: builder.mutation<ApiResponse<{}>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Calendar', 'Event'],
    }),
    
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<ApiResponse<User>, { name: string; timezone: string }>({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    changePassword: builder.mutation<ApiResponse<{}>, { currentPassword: string; newPassword: string }>({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    
    deleteAccount: builder.mutation<ApiResponse<{}>, void>({
      query: () => ({
        url: '/auth/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Calendar', 'Event'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;