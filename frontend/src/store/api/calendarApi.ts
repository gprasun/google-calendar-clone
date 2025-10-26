import { baseApi } from './baseApi';
import {Calendar, ApiResponse, ShareCalendarRequest} from '@/types';

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendars: builder.query<ApiResponse<Calendar[]>, { includeShared?: boolean }>({
      query: ({ includeShared = false } = {}) => ({
        url: '/calendars',
        params: { includeShared },
      }),
      providesTags: ['Calendar'],
    }),
    
    createCalendar: builder.mutation<ApiResponse<Calendar>, {
      name: string;
      description?: string;
      color: string;
      isPublic: boolean;
    }>({
      query: (calendarData) => ({
        url: '/calendars',
        method: 'POST',
        body: calendarData,
      }),
      invalidatesTags: ['Calendar'],
    }),
    
    updateCalendar: builder.mutation<ApiResponse<Calendar>, {
      id: string;
      name: string;
      description?: string;
      color: string;
    }>({
      query: ({ id, ...calendarData }) => ({
        url: `/calendars/${id}`,
        method: 'PUT',
        body: calendarData,
      }),
      invalidatesTags: ['Calendar'],
    }),
    
    deleteCalendar: builder.mutation<ApiResponse<{}>, string>({
      query: (id) => ({
        url: `/calendars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calendar', 'Event'],
    }),
    
    shareCalendar: builder.mutation<ApiResponse<{}>, ShareCalendarRequest >({
      query: ({ id, email, role }) => ({
        url: `/calendars/${id}/share`,
        method: 'POST',
        body: { email, role },
      }),
      invalidatesTags: ['Calendar'],
    }),
    
    getCalendarShares: builder.query<ApiResponse<any[]>, string>({
      query: (id) => `/calendars/${id}/shares`,
      providesTags: ['Calendar'],
    }),
  }),
});

export const {
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useShareCalendarMutation,
  useGetCalendarSharesQuery,
} = calendarApi;