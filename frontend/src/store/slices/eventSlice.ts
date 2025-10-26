import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { EventState, Event, DateRange } from '@/types';
import { eventApi } from '../api/eventApi';

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  filters: {
    calendarIds: [],
    dateRange: null,
  },
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    
    setCalendarFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.calendarIds = action.payload;
    },
    
    setDateRangeFilter: (state, action: PayloadAction<DateRange | null>) => {
      state.filters.dateRange = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {
        calendarIds: [],
        dateRange: null,
      };
    },
    
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addMatcher(eventApi.endpoints.getEventsByRange.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(eventApi.endpoints.getEventsByRange.matchFulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.events = action.payload.data;
        }
      })
      .addMatcher(eventApi.endpoints.getEventsByRange.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(eventApi.endpoints.createEvent.matchFulfilled, (state, action) => {
        if (action.payload.success) {
          state.events.push(action.payload.data);
        }
      })
      .addMatcher(eventApi.endpoints.updateEvent.matchFulfilled, (state, action) => {
        if (action.payload.success) {
          const index = state.events.findIndex(event => event.id === action.payload.data.id);
          if (index !== -1) {
            state.events[index] = action.payload.data;
          }
        }
      })
      .addMatcher(eventApi.endpoints.deleteEvent.matchFulfilled, (state, action) => {
        // Remove event from local state (event ID is in the original args)
        const eventId = action.meta.arg.originalArgs;
        state.events = state.events.filter(event => event.id !== eventId);
      });
  },
});

export const {
  setSelectedEvent,
  setCalendarFilter,
  setDateRangeFilter,
  clearFilters,
  addEvent,
  updateEvent,
  removeEvent,
} = eventSlice.actions;

export default eventSlice.reducer;