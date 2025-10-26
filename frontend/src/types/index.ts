// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
}

export interface AuthResponse {
  user: User;
  sessionId: string;
}

// Calendar Types
export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  isPublic: boolean;
  userId: string;
}

// Event Types
export interface EventParticipant {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  participants?: EventParticipant[];
  calendar?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  participants?: { email: string; name?: string }[];
}



// Calendar Sharing
export interface CalendarShare {
  id: string;
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  user: {
    name: string;
    email: string;
  };
}

export interface ShareCalendarRequest {
  id: string;
  email: string;
  role: 'viewer' | 'editor';
}

// UI Types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface EventFormData {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  location: string;
  color: string;
  calendarId: string;
  isRecurring: boolean;
  recurrenceRule: string;
  participants: string[];
}

// Search and Pagination
export interface SearchParams {
  query?: string;
  calendarIds?: string[];
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  calendar: CalendarState;
  events: EventState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface CalendarState {
  calendars: Calendar[];
  activeCalendarId: string | null;
  currentDate: string;
  view: CalendarView;
  loading: boolean;
}

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  filters: {
    calendarIds: string[];
    dateRange: DateRange | null;
  };
}

export interface UIState {
  sidebarOpen: boolean;
  eventModalOpen: boolean;
  eventFormData: EventFormData | null;
  editingEvent: Event | null;
  calendarModalOpen: boolean;
  calendarFormData: CalendarFormData | null;
  shareModalOpen: boolean;
  shareCalendarId: string | null;
  profileModalOpen: boolean;
  loading: {
    global: boolean;
    events: boolean;
    calendars: boolean;
  };
  error: string | null;
}

export interface CalendarFormData {
  id?: string;
  name: string;
  description: string;
  color: string;
  isPublic: boolean;
}