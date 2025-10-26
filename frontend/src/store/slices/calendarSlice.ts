import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CalendarState, Calendar, CalendarView } from '@/types';
import { calendarApi } from '../api/calendarApi';

const initialState: CalendarState = {
  calendars: [],
  activeCalendarId: null,
  currentDate: new Date().toISOString().split('T')[0],
  view: 'month',
  loading: false,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setActiveCalendar: (state, action: PayloadAction<string | null>) => {
      state.activeCalendarId = action.payload;
    },
    
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    
    setView: (state, action: PayloadAction<CalendarView>) => {
      state.view = action.payload;
    },
    
    navigateDate: (state, action: PayloadAction<'prev' | 'next' | 'today'>) => {
      const currentDate = new Date(state.currentDate);
      
      switch (action.payload) {
        case 'prev':
          if (state.view === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
          } else if (state.view === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
          } else {
            currentDate.setDate(currentDate.getDate() - 1);
          }
          break;
        case 'next':
          if (state.view === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else if (state.view === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else {
            currentDate.setDate(currentDate.getDate() + 1);
          }
          break;
        case 'today':
          currentDate.setTime(Date.now());
          break;
      }
      
      state.currentDate = currentDate.toISOString().split('T')[0];
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addMatcher(calendarApi.endpoints.getCalendars.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(calendarApi.endpoints.getCalendars.matchFulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.calendars = action.payload.data;
          // Set first calendar as active if none selected
          if (!state.activeCalendarId && action.payload.data.length > 0) {
            state.activeCalendarId = action.payload.data[0].id;
          }
        }
      })
      .addMatcher(calendarApi.endpoints.getCalendars.matchRejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setActiveCalendar, setCurrentDate, setView, navigateDate } = calendarSlice.actions;
export default calendarSlice.reducer;