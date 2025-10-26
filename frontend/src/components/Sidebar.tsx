import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, MoreHorizontal, Share2, Edit, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { useGetCalendarsQuery, useDeleteCalendarMutation } from '@store/api/calendarApi';
import { setActiveCalendar } from '@store/slices/calendarSlice';
import { openCalendarModal, openShareModal } from '@store/slices/uiSlice';
import MiniCalendar from './MiniCalendar';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { activeCalendarId } = useAppSelector((state) => state.calendar);
  const { user } = useAppSelector((state) => state.auth);
  const { data: calendarsResponse } = useGetCalendarsQuery({ includeShared: true });
  const [deleteCalendar] = useDeleteCalendarMutation();
  
  const allCalendars = calendarsResponse?.data || [];
  const ownedCalendars = allCalendars.filter(cal => cal.userId === user?.id);
  const sharedCalendars = allCalendars.filter(cal => cal.userId !== user?.id);

  const handleCalendarToggle = (calendarId: string) => {
    dispatch(setActiveCalendar(calendarId === activeCalendarId ? null : calendarId));
  };

  const handleCreateCalendar = () => {
    dispatch(openCalendarModal(null));
  };

  const handleEditCalendar = (calendar: any, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openCalendarModal({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description || '',
      color: calendar.color,
      isPublic: calendar.isPublic,
    }));
  };

  const handleShareCalendar = (calendarId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openShareModal(calendarId));
  };

  const handleDeleteCalendar = async (calendar: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendar.isDefault) {
      alert('Cannot delete default calendar');
      return;
    }
    if (confirm(`Are you sure you want to delete "${calendar.name}"?`)) {
      try {
        await deleteCalendar(calendar.id).unwrap();
      } catch (error) {
        console.error('Failed to delete calendar:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-r border-google-gray-200 overflow-hidden"
        >
          <div className="p-4 space-y-6">
            {/* Mini Calendar */}
            <div>
              <MiniCalendar />
            </div>

            {/* My Calendars */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-google-gray-900">My calendars</h3>
                <button 
                  onClick={handleCreateCalendar}
                  className="p-1 hover:bg-google-gray-100 rounded"
                  title="Create calendar"
                >
                  <Plus className="w-4 h-4 text-google-gray-600" />
                </button>
              </div>
              
              <div className="space-y-1">
                {ownedCalendars.map((calendar) => (
                  <div
                    key={calendar.id}
                    className="group flex items-center space-x-3 p-2 hover:bg-google-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleCalendarToggle(calendar.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="radio"
                        checked={activeCalendarId === calendar.id}
                        onChange={() => handleCalendarToggle(calendar.id)}
                        className="w-4 h-4 rounded border-google-gray-300"
                        style={{ accentColor: calendar.color }}
                      />
                      <Calendar 
                        className="w-4 h-4" 
                        style={{ color: calendar.color }}
                      />
                      <span className="text-sm text-google-gray-700 truncate">
                        {calendar.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => handleShareCalendar(calendar.id, e)}
                        className="p-1 hover:bg-google-gray-200 rounded"
                        title="Share calendar"
                      >
                        <Share2 className="w-3 h-3 text-google-gray-400" />
                      </button>
                      <button 
                        onClick={(e) => handleEditCalendar(calendar, e)}
                        className="p-1 hover:bg-google-gray-200 rounded"
                        title="Edit calendar"
                      >
                        <Edit className="w-3 h-3 text-google-gray-400" />
                      </button>
                      {!calendar.isDefault && (
                        <button 
                          onClick={(e) => handleDeleteCalendar(calendar, e)}
                          className="p-1 hover:bg-google-gray-200 rounded"
                          title="Delete calendar"
                        >
                          <Trash2 className="w-3 h-3 text-google-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Calendars */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-google-gray-900">Other calendars</h3>
              </div>
              
              {sharedCalendars.length === 0 ? (
                <div className="text-sm text-google-gray-500 text-center py-4">
                  No shared calendars
                </div>
              ) : (
                <div className="space-y-1">
                  {sharedCalendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="group flex items-center space-x-3 p-2 hover:bg-google-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleCalendarToggle(calendar.id)}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="radio"
                          checked={activeCalendarId === calendar.id}
                          onChange={() => handleCalendarToggle(calendar.id)}
                          className="w-4 h-4 rounded border-google-gray-300"
                          style={{ accentColor: calendar.color }}
                        />
                        <Calendar 
                          className="w-4 h-4" 
                          style={{ color: calendar.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-google-gray-700 truncate block">
                            {calendar.name}
                          </span>
                          <span className="text-xs text-google-gray-500 truncate block">
                            Shared calendar
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;