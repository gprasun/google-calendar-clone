import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      headers.set('x-session-id', sessionId);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: ['User', 'Calendar', 'Event'],
  endpoints: () => ({}),
});

export type BaseApiResponse<T> = ApiResponse<T>;