import React from 'react';
import { useAppSelector } from '@hooks/redux';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import AgendaView from './AgendaView';
import EventModal from '@features/events/EventModal';
import CalendarModal from './CalendarModal';
import ShareModal from './ShareModal';
import ProfileModal from '@features/auth/ProfileModal';

const CalendarLayout: React.FC = () => {
  const { view } = useAppSelector((state) => state.calendar);

  const renderCalendarView = () => {
    switch (view) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      case 'agenda':
        return <AgendaView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderCalendarView()}
        </main>
      </div>

      <EventModal />
      <CalendarModal />
      <ShareModal />
      <ProfileModal />
    </div>
  );
};

export default CalendarLayout;