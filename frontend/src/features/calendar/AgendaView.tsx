import React from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { useGetUpcomingEventsQuery, useGetTodayEventsQuery, useUpdateParticipantStatusMutation } from '@store/api/eventApi';
import { openEventModal } from '@store/slices/uiSlice';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { fromUTCISOString, getUserTimezone } from '@utils/dateUtils';
import type { Event } from '@/types';

const AgendaView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeCalendarId } = useAppSelector((state) => state.calendar);
  const { data: upcomingResponse } = useGetUpcomingEventsQuery({ limit: 50 });
  const { data: todayResponse } = useGetTodayEventsQuery();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();
  
  const userTimezone = getUserTimezone(user?.timezone);

  const upcomingEvents = upcomingResponse?.data || [];
  const todayEvents = todayResponse?.data || [];

  // Combine and sort events, filter by active calendar if selected
  const allEvents = [...todayEvents, ...upcomingEvents]
    .filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    )
    .filter(event => !activeCalendarId || event.calendarId === activeCalendarId)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  // Group events by timezone-converted date
  const eventsByDate = allEvents.reduce((groups, event) => {
    const eventLocalDate = fromUTCISOString(event.startTime, userTimezone).dateTime;
    const date = format(eventLocalDate, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  return (
    <div className="flex-1 bg-white overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-medium text-google-gray-900 mb-6">Agenda</h2>
        
        {Object.keys(eventsByDate).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-google-gray-400 text-lg mb-2">No upcoming events</div>
            <div className="text-google-gray-500 text-sm">
              Your schedule is clear for the next few days
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(eventsByDate).map(([dateStr, events]) => {
              const date = new Date(dateStr);
              return (
                <div key={dateStr}>
                  <h3 className="text-lg font-medium text-google-gray-900 mb-3 sticky top-0 bg-white py-2">
                    {getDateLabel(date)}
                  </h3>
                  
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="flex items-center space-x-4 p-4 hover:bg-google-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-google-gray-200"
                      >
                        {/* Time */}
                        <div className="w-20 text-sm text-google-gray-600 flex-shrink-0">
                          {event.isAllDay ? (
                            'All day'
                          ) : (
                            format(fromUTCISOString(event.startTime, userTimezone).dateTime, 'h:mm a')
                          )}
                        </div>
                        
                        {/* Event indicator */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        
                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-google-gray-900 truncate">
                            {event.title}
                          </div>
                          {event.location && (
                            <div className="text-sm text-google-gray-500 truncate">
                              {event.location}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-sm text-google-gray-500 truncate mt-1">
                              {event.description}
                            </div>
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <div className="text-sm text-google-gray-500 mt-1">
                              👥 {event.participants.length} participant{event.participants.length > 1 ? 's' : ''}
                            </div>
                          )}
                          
                          {/* RSVP Status and Buttons for Current User */}
                          {(() => {
                            const currentUserParticipant = event.participants?.find(p => p.email === user?.email);
                            if (!currentUserParticipant) return null;
                            
                            return (
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-gray-600">Your RSVP:</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  currentUserParticipant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  currentUserParticipant.status === 'declined' ? 'bg-red-100 text-red-800' :
                                  currentUserParticipant.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {currentUserParticipant.status}
                                </span>
                                
                                {currentUserParticipant.status === 'pending' && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await updateParticipantStatus({
                                            eventId: event.id,
                                            participantId: currentUserParticipant.id,
                                            status: 'accepted'
                                          }).unwrap();
                                        } catch (error) {
                                          console.error('Failed to accept invitation:', error);
                                        }
                                      }}
                                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await updateParticipantStatus({
                                            eventId: event.id,
                                            participantId: currentUserParticipant.id,
                                            status: 'declined'
                                          }).unwrap();
                                        } catch (error) {
                                          console.error('Failed to decline invitation:', error);
                                        }
                                      }}
                                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                        </div>
                        
                        {/* Calendar name */}
                        <div className="text-xs text-google-gray-400 flex-shrink-0">
                          {event.calendar?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaView;