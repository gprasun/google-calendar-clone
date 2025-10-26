import { baseApi } from './baseApi';
import type { Event, CreateEventRequest, ApiResponse } from '@/types';

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ApiResponse<Event[]>, {
      limit?: number;
      offset?: number;
      calendarId?: string;
    }>({
      query: (params = {}) => ({
        url: '/events',
        params,
      }),
      providesTags: ['Event'],
    }),
    
    getEventsByRange: builder.query<ApiResponse<Event[]>, {
      startDate: string;
      endDate: string;
      calendarId?: string;
    }>({
      query: (params) => ({
        url: '/events/range',
        params,
      }),
      providesTags: ['Event'],
    }),
    
    getTodayEvents: builder.query<ApiResponse<Event[]>, void>({
      query: () => '/events/today',
      providesTags: ['Event'],
    }),
    
    getUpcomingEvents: builder.query<ApiResponse<Event[]>, { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: '/events/upcoming',
        params: { limit },
      }),
      providesTags: ['Event'],
    }),
    
    createEvent: builder.mutation<ApiResponse<Event>, CreateEventRequest>({
      query: (eventData) => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Event'],
    }),
    
    updateEvent: builder.mutation<ApiResponse<Event>, {
      id: string;
      data: Partial<CreateEventRequest>;
    }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
    
    deleteEvent: builder.mutation<ApiResponse<{}>, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
    
    updateParticipantStatus: builder.mutation<ApiResponse<{ id: string; email: string; name: string; status: string }>, {
      eventId: string;
      participantId: string;
      status: 'pending' | 'accepted' | 'declined' | 'tentative';
    }>({
      query: ({ eventId, participantId, status }) => ({
        url: `/events/${eventId}/participants/${participantId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventsByRangeQuery,
  useGetTodayEventsQuery,
  useGetUpcomingEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUpdateParticipantStatusMutation,
} = eventApi;