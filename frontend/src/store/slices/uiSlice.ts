import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, EventFormData, CalendarFormData, Event } from '@/types';

const initialState: UIState = {
  sidebarOpen: true,
  eventModalOpen: false,
  eventFormData: null,
  editingEvent: null,
  calendarModalOpen: false,
  calendarFormData: null,
  shareModalOpen: false,
  shareCalendarId: null,
  profileModalOpen: false,
  loading: {
    global: false,
    events: false,
    calendars: false,
  },
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    openEventModal: (state, action: PayloadAction<{ formData: EventFormData | null; event?: Event }>) => {
      state.eventModalOpen = true;
      state.eventFormData = action.payload.formData;
      state.editingEvent = action.payload.event || null;
    },
    
    closeEventModal: (state) => {
      state.eventModalOpen = false;
      state.eventFormData = null;
      state.editingEvent = null;
    },
    
    setEventFormData: (state, action: PayloadAction<EventFormData>) => {
      state.eventFormData = action.payload;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setEventsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.events = action.payload;
    },
    
    setCalendarsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.calendars = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    openCalendarModal: (state, action: PayloadAction<CalendarFormData | null>) => {
      state.calendarModalOpen = true;
      state.calendarFormData = action.payload;
    },
    
    closeCalendarModal: (state) => {
      state.calendarModalOpen = false;
      state.calendarFormData = null;
    },
    
    openShareModal: (state, action: PayloadAction<string>) => {
      state.shareModalOpen = true;
      state.shareCalendarId = action.payload;
    },
    
    closeShareModal: (state) => {
      state.shareModalOpen = false;
      state.shareCalendarId = null;
    },
    
    openProfileModal: (state) => {
      state.profileModalOpen = true;
    },
    
    closeProfileModal: (state) => {
      state.profileModalOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openEventModal,
  closeEventModal,
  setEventFormData,
  setGlobalLoading,
  setEventsLoading,
  setCalendarsLoading,
  setError,
  clearError,
  openCalendarModal,
  closeCalendarModal,
  openShareModal,
  closeShareModal,
  openProfileModal,
  closeProfileModal,
} = uiSlice.actions;

export default uiSlice.reducer;