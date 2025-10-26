import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { setCurrentDate, navigateDate } from '@store/slices/calendarSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

const MiniCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDate } = useAppSelector((state) => state.calendar);
  
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

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    dispatch(setCurrentDate(dateStr));
  };

  const handlePrevMonth = () => {
    dispatch(navigateDate('prev'));
  };

  const handleNextMonth = () => {
    dispatch(navigateDate('next'));
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-google-gray-900">
          {format(currentDateObj, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-google-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-google-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-google-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4 text-google-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div
            key={index}
            className="text-xs font-medium text-google-gray-500 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDateObj);
          const isSelected = isSameDay(day, currentDateObj);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
                ${isCurrentMonth ? 'text-google-gray-900' : 'text-google-gray-400'}
                ${isSelected ? 'bg-google-blue text-white' : 'hover:bg-google-gray-100'}
                ${isToday && !isSelected ? 'bg-google-blue-light text-google-blue font-medium' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;