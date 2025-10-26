import React from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { useGetEventsByRangeQuery } from '@store/api/eventApi';
import { openEventModal } from '@store/slices/uiSlice';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  parseISO,
  isToday,
  addHours,
  startOfDay,
  subDays,
  addDays
} from 'date-fns';
import { fromUTCISOString, getUserTimezone } from '@utils/dateUtils';
import type { Event } from '@/types';

const WeekView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDate, activeCalendarId } = useAppSelector((state) => state.calendar);
  const { user } = useAppSelector((state) => state.auth);
  
  const userTimezone = getUserTimezone(user?.timezone);
  
  const currentDateObj = new Date(currentDate);
  const weekStart = startOfWeek(currentDateObj);
  const weekEnd = endOfWeek(currentDateObj);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate hours (6 AM to 11 PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Expand fetch range to account for timezone shifts
  const expandedWeekStart = subDays(weekStart, 1);
  const expandedWeekEnd = addDays(weekEnd, 1);

  // Fetch events for the expanded week range
  const { data: eventsResponse } = useGetEventsByRangeQuery({
    startDate: expandedWeekStart.toISOString(),
    endDate: expandedWeekEnd.toISOString(),
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

  const getAllDayEvents = (day: Date): Event[] => {
    return getEventsForDay(day).filter(event => event.isAllDay);
  };

  const getTimedEvents = (day: Date): Event[] => {
    return getEventsForDay(day).filter(event => !event.isAllDay);
  };

  const handleEventClick = (event: Event) => {
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

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const startTime = addHours(startOfDay(day), hour);
    const endTime = addHours(startTime, 1);
    
    dispatch(openEventModal({
      formData: {
        title: '',
        description: '',
        startDate: format(day, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm'),
        endDate: format(day, 'yyyy-MM-dd'),
        endTime: format(endTime, 'HH:mm'),
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

  const getEventPosition = (event: Event) => {
    const startDateTime = fromUTCISOString(event.startTime, userTimezone).dateTime;
    const endDateTime = fromUTCISOString(event.endTime, userTimezone).dateTime;
    const startHour = startDateTime.getHours() + startDateTime.getMinutes() / 60;
    const endHour = endDateTime.getHours() + endDateTime.getMinutes() / 60;
    
    const top = ((startHour - 6) * 60); // 60px per hour
    const height = (endHour - startHour) * 60;
    
    return { top, height };
  };

  return (
    <div className="flex-1 bg-white overflow-auto">
      {/* Header with days */}
      <div className="sticky top-0 bg-white border-b border-google-gray-200 z-10">
        <div className="grid grid-cols-8">
          {/* Time column header */}
          <div className="p-4 border-r border-google-gray-200"></div>
          
          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="p-4 text-center border-r border-google-gray-200 last:border-r-0"
            >
              <div className="text-sm font-medium text-google-gray-600">
                {format(day, 'EEE')}
              </div>
              <div
                className={`
                  text-2xl font-medium mt-1
                  ${isToday(day) ? 'bg-google-blue text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : 'text-google-gray-900'}
                `}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* All-day events section */}
        <div className="grid grid-cols-8 border-b border-google-gray-200">
          <div className="p-2 border-r border-google-gray-200 text-xs text-google-gray-500">
            All day
          </div>
          {weekDays.map((day) => {
            const allDayEvents = getAllDayEvents(day);
            return (
              <div
                key={`allday-${day.toISOString()}`}
                className="p-2 border-r border-google-gray-200 last:border-r-0 min-h-[60px]"
              >
                {allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="event-block mb-1"
                    style={{ backgroundColor: event.color }}
                  >
                    <div>{event.title}</div>
                    {event.location && (
                      <div className="text-xs opacity-75">📍 {event.location}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-google-gray-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-google-gray-100 p-2 text-xs text-google-gray-500"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const timedEvents = getTimedEvents(day);
            return (
              <div
                key={day.toISOString()}
                className="border-r border-google-gray-200 last:border-r-0 relative"
              >
                {/* Hour slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-google-gray-100 hover:bg-google-gray-50 cursor-pointer"
                    onClick={() => handleTimeSlotClick(day, hour)}
                  />
                ))}

                {/* Timed events */}
                {timedEvents.map((event) => {
                  const { top, height } = getEventPosition(event);
                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="absolute left-1 right-1 event-block z-10 cursor-pointer"
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 20)}px`,
                        backgroundColor: event.color,
                      }}
                    >
                      <div className="p-1">
                        <div className="font-medium text-xs">
                          {format(fromUTCISOString(event.startTime, userTimezone).dateTime, 'h:mm a')}
                        </div>
                        <div className="text-xs truncate">{event.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;