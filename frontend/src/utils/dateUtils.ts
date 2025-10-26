import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * Convert local date/time to UTC ISO string for API
 */
export const toUTCISOString = (date: string, time: string, timezone: string): string => {
  // For all-day events, return date only
  if (!time) {
    return date;
  }
  
  // Create date in the specified timezone and convert to UTC
  const localDateTime = new Date(`${date}T${time}:00`);
  const utcDateTime = zonedTimeToUtc(localDateTime, timezone);
  return utcDateTime.toISOString();
};

/**
 * Convert UTC ISO string from API to local date/time
 */
export const fromUTCISOString = (isoString: string, timezone: string) => {
  // Handle all-day events (date-only format)
  if (!isoString.includes('T')) {
    return {
      date: isoString,
      time: '00:00',
      dateTime: new Date(isoString)
    };
  }
  
  const utcDate = parseISO(isoString);
  const zonedDate = utcToZonedTime(utcDate, timezone);
  
  return {
    date: format(zonedDate, 'yyyy-MM-dd'),
    time: format(zonedDate, 'HH:mm'),
    dateTime: zonedDate
  };
};

/**
 * Format all-day event date (no timezone conversion needed)
 */
export const formatAllDayDate = (date: string): string => {
  return date; // All-day events are date-only, no timezone conversion
};

/**
 * Get user's timezone from browser or fallback
 */
export const getUserTimezone = (userTimezone?: string): string => {
  return userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
};