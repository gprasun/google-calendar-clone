import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@store/index';
import ErrorBoundary from '@components/ErrorBoundary';
import ProtectedRoute from '@components/ProtectedRoute';
import Toast from '@components/Toast';
import LoadingSpinner from '@components/LoadingSpinner';
import LoginForm from '@features/auth/LoginForm';
import RegisterForm from '@features/auth/RegisterForm';
import CalendarLayout from '@features/calendar/CalendarLayout';
import '@styles/globals.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate 
          loading={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          } 
          persistor={persistor}
        >
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <CalendarLayout />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toast />
            </div>
          </Router>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;