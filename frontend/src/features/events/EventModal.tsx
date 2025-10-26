import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Calendar, Clock, MapPin, Repeat } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { closeEventModal } from '@store/slices/uiSlice';
import { useCreateEventMutation, useUpdateEventMutation, useUpdateParticipantStatusMutation } from '@store/api/eventApi';
import { useGetCalendarsQuery } from '@store/api/calendarApi';
import { toUTCISOString, formatAllDayDate, getUserTimezone } from '@utils/dateUtils';
import type { EventFormData } from '@/types';

const EventModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { eventModalOpen, eventFormData, editingEvent } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { activeCalendarId } = useAppSelector((state) => state.calendar);
  const { data: calendarsResponse } = useGetCalendarsQuery({});
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();

  const calendars = calendarsResponse?.data || [];
  const isEditing = !!eventFormData?.id;

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    isAllDay: false,
    location: '',
    color: '#1a73e8',
    calendarId: '',
    isRecurring: false,
    recurrenceRule: '',
    participants: [],
  });

  useEffect(() => {
    if (eventFormData) {
      setFormData(eventFormData);
    } else if (activeCalendarId) {
      // Set default calendar to currently selected one
      setFormData(prev => ({ ...prev, calendarId: activeCalendarId }));
    }
  }, [eventFormData, activeCalendarId]);

  const handleClose = () => {
    dispatch(closeEventModal());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const userTimezone = getUserTimezone(user?.timezone);

    const startDateTime = formData.isAllDay 
      ? formatAllDayDate(formData.startDate)
      : toUTCISOString(formData.startDate, formData.startTime, userTimezone);
    
    const endDateTime = formData.isAllDay 
      ? formatAllDayDate(formData.endDate)
      : toUTCISOString(formData.endDate, formData.endTime, userTimezone);

    const eventData = {
      title: formData.title,
      description: formData.description,
      startTime: startDateTime,
      endTime: endDateTime,
      isAllDay: formData.isAllDay,
      location: formData.location,
      color: formData.color,
      calendarId: formData.calendarId || activeCalendarId || calendars[0]?.id || '',
      isRecurring: formData.isRecurring,
      recurrenceRule: formData.isRecurring ? formData.recurrenceRule : undefined,
      participants: formData.participants.length > 0 
        ? formData.participants.map(email => ({ email: email.trim() })).filter(p => p.email)
        : undefined,
    };

    try {
      if (isEditing && eventFormData?.id) {
        await updateEvent({
          id: eventFormData.id,
          data: eventData,
        }).unwrap();
      } else {
        await createEvent(eventData).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const colorOptions = [
    { value: '#1a73e8', label: 'Blue' },
    { value: '#d50000', label: 'Red' },
    { value: '#f9ab00', label: 'Yellow' },
    { value: '#0d7377', label: 'Green' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#ff6d01', label: 'Orange' },
    { value: '#039be5', label: 'Teal' },
    { value: '#ad1457', label: 'Pink' },
  ];

  return (
    <Dialog open={eventModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-google-gray-200">
            <Dialog.Title className="text-lg font-medium text-google-gray-900">
              {isEditing ? 'Edit Event' : 'New Event'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-google-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-google-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Add title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-lg font-medium border-none outline-none placeholder-google-gray-400"
                autoFocus
              />
            </div>

            {/* Date and Time */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-google-gray-400" />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                    className="rounded border-google-gray-300"
                  />
                  <span className="text-sm text-google-gray-700">All day</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-google-gray-600 mb-1">Start</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    required
                  />
                  {!formData.isAllDay && (
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="input-field mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm text-google-gray-600 mb-1">End</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    required
                  />
                  {!formData.isAllDay && (
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input-field mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-google-gray-400" />
              <input
                type="text"
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="flex-1 border-none outline-none placeholder-google-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                placeholder="Add description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-none outline-none placeholder-google-gray-400 resize-none"
                rows={3}
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm text-google-gray-600 mb-2">Participants</label>
              
              {/* Current user's RSVP status if they're a participant */}
              {isEditing && editingEvent?.participants && user && (() => {
                const userParticipant = editingEvent.participants.find(p => p.email === user.email);
                if (userParticipant) {
                  return (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Your response:</span>
                        <div className="flex space-x-2">
                          {['accepted', 'declined', 'tentative'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={async () => {
                                try {
                                  await updateParticipantStatus({
                                    eventId: eventFormData.id!,
                                    participantId: userParticipant.id,
                                    status: status as any
                                  }).unwrap();
                                } catch (error) {
                                  console.error('Failed to update RSVP:', error);
                                }
                              }}
                              className={`px-3 py-1 text-xs rounded-full ${
                                userParticipant.status === status
                                  ? status === 'accepted' ? 'bg-green-100 text-green-800'
                                    : status === 'declined' ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status === 'accepted' ? 'Yes' : status === 'declined' ? 'No' : 'Maybe'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Status: {userParticipant.status === 'accepted' ? '✅ Going' 
                                : userParticipant.status === 'declined' ? '❌ Not going'
                                : userParticipant.status === 'tentative' ? '❓ Maybe'
                                : '⏳ Pending'}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Add new participants textarea */}
              <textarea
                placeholder="Enter email addresses, one per line"
                value={formData.participants.join('\n')}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value.split('\n').filter(email => email.trim()) })}
                className="w-full input-field resize-none"
                rows={3}
              />
            </div>

            {/* Calendar Selection */}
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-google-gray-400" />
              <select
                value={formData.calendarId}
                onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
                className="flex-1 border-none outline-none bg-transparent"
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm text-google-gray-600 mb-2">Color</label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color.value ? 'border-google-gray-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Recurring */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Repeat className="w-5 h-5 text-google-gray-400" />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked, recurrenceRule: e.target.checked ? 'FREQ=WEEKLY;INTERVAL=1' : '' })}
                    className="rounded border-google-gray-300"
                  />
                  <span className="text-sm text-google-gray-700">Repeat</span>
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="ml-8 space-y-3">
                  <select
                    value={formData.recurrenceRule.split(';')[0] + ';INTERVAL=1'}
                    onChange={(e) => {
                      const baseRule = e.target.value;
                      const endDatePart = formData.recurrenceRule.includes('UNTIL=') 
                        ? ';' + formData.recurrenceRule.split(';').find(part => part.startsWith('UNTIL='))
                        : '';
                      setFormData({ ...formData, recurrenceRule: baseRule + endDatePart });
                    }}
                    className="input-field"
                  >
                    <option value="FREQ=DAILY;INTERVAL=1">Daily</option>
                    <option value="FREQ=WEEKLY;INTERVAL=1">Weekly</option>
                    <option value="FREQ=MONTHLY;INTERVAL=1">Monthly</option>
                    <option value="FREQ=YEARLY;INTERVAL=1">Yearly</option>
                  </select>
                  
                  <div>
                    <label className="block text-sm text-google-gray-600 mb-1">Ends</label>
                    <input
                      type="date"
                      value={formData.recurrenceRule.includes('UNTIL=') 
                        ? formData.recurrenceRule.split('UNTIL=')[1]?.split('T')[0] || ''
                        : ''}
                      onChange={(e) => {
                        const baseRule = formData.recurrenceRule.split(';UNTIL=')[0];
                        const newRule = e.target.value 
                          ? baseRule + ';UNTIL=' + e.target.value + 'T23:59:59Z'
                          : baseRule;
                        setFormData({ ...formData, recurrenceRule: newRule });
                      }}
                      className="input-field"
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              )}
            </div>



            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || !formData.title.trim()}
                className="btn-primary"
              >
                {isCreating || isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EventModal;