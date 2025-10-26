import React from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { useGetEventsByRangeQuery, useDeleteEventMutation } from '@store/api/eventApi';
import { setCurrentDate } from '@store/slices/calendarSlice';
import { openEventModal } from '@store/slices/uiSlice';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  parseISO,
  isToday,
  subDays,
  addDays
} from 'date-fns';
import { fromUTCISOString, getUserTimezone } from '@utils/dateUtils';
import type { Event } from '@/types';

const MonthView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDate, activeCalendarId } = useAppSelector((state) => state.calendar);
  const { user } = useAppSelector((state) => state.auth);
  const [deleteEvent] = useDeleteEventMutation();
  
  const userTimezone = getUserTimezone(user?.timezone);
  
  const currentDateObj = new Date(currentDate);
  const monthStart = startOfMonth(currentDateObj);
  const monthEnd = endOfMonth(currentDateObj);
  
  // Get the first day of the week for the month
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Get all days to display (including previous/next month days)
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Expand fetch range to capture multi-day events that span across months
  const expandedStartDate = subDays(startDate, 31);
  const expandedEndDate = addDays(endDate, 31);

  // Fetch events for the expanded month range
  const { data: eventsResponse } = useGetEventsByRangeQuery({
    startDate: expandedStartDate.toISOString(),
    endDate: expandedEndDate.toISOString(),
    ...(activeCalendarId && { calendarId: activeCalendarId }),
  });

  const events = eventsResponse?.data || [];

  const getEventsForDay = (day: Date): Event[] => {
    return events.filter(event => {
      const startDate = fromUTCISOString(event.startTime, userTimezone).dateTime;
      const endDate = fromUTCISOString(event.endTime, userTimezone).dateTime;
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      
      return dayStart <= endDate && dayEnd >= startDate;
    });
  };

  const handleDateClick = (date: Date) => {
    dispatch(setCurrentDate(format(date, 'yyyy-MM-dd')));
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const startDateTime = fromUTCISOString(event.startTime, userTimezone);
    const endDateTime = fromUTCISOString(event.endTime, userTimezone);

    dispatch(openEventModal({
      formData: {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: startDateTime.date,
        startTime: startDateTime.time,
        endDate: endDateTime.date,
        endTime: endDateTime.time,
        isAllDay: event.isAllDay,
        location: event.location || '',
        color: event.color,
        calendarId: event.calendarId,
        isRecurring: event.isRecurring,
        recurrenceRule: event.recurrenceRule || '',
        participants: event.participants?.map(p => p.email) || [],
      },
      event
    }));
  };

  const handleEventDelete = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${event.title}"?`)) {
      try {
        await deleteEvent(event.id).unwrap();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleCreateEvent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    dispatch(openEventModal({
      formData: {
        title: '',
        description: '',
        startDate: dateStr,
        startTime: '09:00',
        endDate: dateStr,
        endTime: '10:00',
        isAllDay: false,
        location: '',
        color: '#1a73e8',
        calendarId: activeCalendarId || '',
        isRecurring: false,
        recurrenceRule: '',
        participants: [],
      }
    }));
  };

  return (
    <div className="flex-1 bg-white">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-google-gray-200">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <div
            key={day}
            className="p-4 text-sm font-medium text-google-gray-600 text-center border-r border-google-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        {allDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDateObj);
          const isSelected = isSameDay(day, currentDateObj);
          const dayEvents = getEventsForDay(day);
          const todayClass = isToday(day) ? 'bg-google-blue-light' : '';

          return (
            <div
              key={index}
              className={`
                calendar-cell group relative
                ${!isCurrentMonth ? 'bg-google-gray-50 text-google-gray-400' : ''}
                ${isSelected ? 'bg-blue-50' : ''}
                ${todayClass}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isToday(day) ? 'bg-google-blue text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${isSelected && !isToday(day) ? 'text-google-blue' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Add event button (visible on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateEvent(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 text-google-gray-400 hover:text-google-blue transition-opacity"
                >
                  +
                </button>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className="group event-block relative"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  >
                    <div onClick={(e) => handleEventClick(event, e)} className="cursor-pointer">
                      {event.isAllDay ? (
                        <span>{event.title}</span>
                      ) : (
                        <span>
                          {format(fromUTCISOString(event.startTime, userTimezone).dateTime, 'h:mm a')} {event.title}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleEventDelete(event, e)}
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-white hover:text-red-200 text-xs p-1"
                      title="Delete event"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* More events indicator */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-google-gray-500 px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;