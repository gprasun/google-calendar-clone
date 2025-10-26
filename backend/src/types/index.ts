import { Request } from 'express';

// User type (without password for security)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
  body: any;
  params: any;
  query: any;
}

// User types
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  timezone?: string;
}

// Calendar types
export interface CreateCalendarRequest {
  name: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

export interface UpdateCalendarRequest {
  name?: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

export interface ShareCalendarRequest {
  email: string;
  role: 'viewer' | 'editor';
}

// Event types
export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAllDay?: boolean;
  color?: string;
  calendarId: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  participants?: EventParticipantRequest[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  color?: string;
  calendarId?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  participants?: EventParticipantRequest[];
}

export interface EventParticipantRequest {
  email: string;
  name?: string;
}



// Query parameters
export interface GetEventsQuery {
  startDate?: string;
  endDate?: string;
  calendarId?: string;
  limit?: string;
  offset?: string;
}

export interface GetCalendarsQuery {
  includeShared?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Recurring event types
export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  endDate?: string;
  count?: number;
  byDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
  byWeekNo?: number[];
  byYearDay?: number[];
  bySetPos?: number[];
  weekStart?: 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}


