import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { toggleSidebar, openProfileModal } from '@store/slices/uiSlice';
import { navigateDate, setView } from '@store/slices/calendarSlice';
import { openEventModal } from '@store/slices/uiSlice';
import { useLogoutMutation } from '@store/api/authApi';
import { clearCredentials } from '@store/slices/authSlice';
import { baseApi } from '@store/api/baseApi';
import { format } from 'date-fns';
import type { CalendarView } from '@/types';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDate, view } = useAppSelector((state) => state.calendar);
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleCreateEvent = () => {
    const { activeCalendarId } = useAppSelector((state) => state.calendar);
    dispatch(openEventModal({
      formData: {
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endDate: format(new Date(), 'yyyy-MM-dd'),
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

  const handleProfileClick = () => {
    dispatch(openProfileModal());
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear credentials and reset API cache
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    dispatch(setView(newView));
  };

  const getDateDisplay = () => {
    const date = new Date(currentDate);
    switch (view) {
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'week':
        return format(date, 'MMM d, yyyy');
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  return (
    <header className="bg-white border-b border-google-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-google-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-google-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-medium text-google-gray-900">Calendar</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreateEvent}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(navigateDate('prev'))}
              className="p-2 hover:bg-google-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-google-gray-600" />
            </button>
            
            <button
              onClick={() => dispatch(navigateDate('today'))}
              className="px-4 py-2 text-sm font-medium text-google-gray-700 hover:bg-google-gray-100 rounded-lg"
            >
              Today
            </button>
            
            <button
              onClick={() => dispatch(navigateDate('next'))}
              className="p-2 hover:bg-google-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-google-gray-600" />
            </button>
          </div>

          <div className="text-xl font-medium text-google-gray-900">
            {getDateDisplay()}
          </div>

          <div className="flex items-center space-x-1 bg-google-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => handleViewChange(viewOption)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${
                  view === viewOption
                    ? 'bg-white text-google-blue shadow-sm'
                    : 'text-google-gray-600 hover:text-google-gray-900'
                }`}
              >
                {viewOption}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">

            <div className="relative group">
              <div 
                onClick={handleProfileClick}
                className="flex items-center space-x-2 p-2 hover:bg-google-gray-100 rounded-lg cursor-pointer"
              >
                <div className="w-8 h-8 bg-google-blue rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-google-gray-700">
                  {user?.name}
                </span>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-google-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-google-gray-700 hover:bg-google-gray-50"
                  >
                    Account Settings
                  </button>
                  <hr className="border-google-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-google-gray-700 hover:bg-google-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;