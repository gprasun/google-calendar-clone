import React from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { useGetEventsByRangeQuery } from '@store/api/eventApi';
import { openEventModal } from '@store/slices/uiSlice';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  parseISO,
  isToday,
  isSameDay,
  addHours,
  subDays,
  addDays
} from 'date-fns';
import { fromUTCISOString, getUserTimezone } from '@utils/dateUtils';
import type { Event } from '@/types';

const DayView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDate, activeCalendarId } = useAppSelector((state) => state.calendar);
  const { user } = useAppSelector((state) => state.auth);
  
  const userTimezone = getUserTimezone(user?.timezone);
  
  const currentDateObj = new Date(currentDate);
  const dayStart = startOfDay(currentDateObj);
  const dayEnd = endOfDay(currentDateObj);

  // Generate hours (6 AM to 11 PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Expand fetch range to account for timezone shifts
  const expandedDayStart = subDays(dayStart, 1);
  const expandedDayEnd = addDays(dayEnd, 1);

  // Fetch events for the expanded day range
  const { data: eventsResponse } = useGetEventsByRangeQuery({
    startDate: expandedDayStart.toISOString(),
    endDate: expandedDayEnd.toISOString(),
    ...(activeCalendarId && { calendarId: activeCalendarId }),
  });

  const events = eventsResponse?.data || [];
  
  // Filter events to only show those that appear on the current day in user timezone
  const dayEvents = events.filter(event => {
    const startDate = fromUTCISOString(event.startTime, userTimezone).dateTime;
    const endDate = fromUTCISOString(event.endTime, userTimezone).dateTime;
    const dayStart = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), currentDateObj.getDate());
    const dayEnd = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), currentDateObj.getDate(), 23, 59, 59);
    
    return dayStart <= endDate && dayEnd >= startDate;
  });
  
  const allDayEvents = dayEvents.filter(event => event.isAllDay);
  const timedEvents = dayEvents.filter(event => !event.isAllDay);

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

  const handleTimeSlotClick = (hour: number) => {
    const startTime = addHours(dayStart, hour);
    const endTime = addHours(startTime, 1);
    
    dispatch(openEventModal({
      formData: {
        title: '',
        description: '',
        startDate: format(currentDateObj, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm'),
        endDate: format(currentDateObj, 'yyyy-MM-dd'),
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
    
    const top = ((startHour - 6) * 80); // 80px per hour
    const height = (endHour - startHour) * 80;
    
    return { top, height };
  };

  return (
    <div className="flex-1 bg-white overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-google-gray-200 z-10">
        <div className="p-6">
          <div className="text-center">
            <div className="text-sm font-medium text-google-gray-600">
              {format(currentDateObj, 'EEEE')}
            </div>
            <div
              className={`
                text-3xl font-medium mt-2
                ${isToday(currentDateObj) ? 'bg-google-blue text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto' : 'text-google-gray-900'}
              `}
            >
              {format(currentDateObj, 'd')}
            </div>
          </div>
        </div>

        {/* All-day events section */}
        {allDayEvents.length > 0 && (
          <div className="border-b border-google-gray-200 p-4">
            <div className="text-sm font-medium text-google-gray-600 mb-2">All day</div>
            <div className="space-y-2">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="event-block"
                  style={{ backgroundColor: event.color }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="relative">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r border-google-gray-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b border-google-gray-100 p-2 text-sm text-google-gray-500"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative">
            {/* Hour slots */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b border-google-gray-100 hover:bg-google-gray-50 cursor-pointer px-4"
                onClick={() => handleTimeSlotClick(hour)}
              />
            ))}

            {/* Timed events */}
            {timedEvents.map((event) => {
              const { top, height } = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="absolute left-4 right-4 event-block z-10 cursor-pointer"
                  style={{
                    top: `${top}px`,
                    height: `${Math.max(height, 30)}px`,
                    backgroundColor: event.color,
                  }}
                >
                  <div className="p-2">
                    <div className="font-medium text-sm">
                      {format(fromUTCISOString(event.startTime, userTimezone).dateTime, 'h:mm a')} - {format(fromUTCISOString(event.endTime, userTimezone).dateTime, 'h:mm a')}
                    </div>
                    <div className="text-sm font-medium">{event.title}</div>
                    {event.location && (
                      <div className="text-xs opacity-90">{event.location}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current time indicator */}
            {isToday(currentDateObj) && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                style={{
                  top: `${((new Date().getHours() + new Date().getMinutes() / 60 - 6) * 80)}px`,
                }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;