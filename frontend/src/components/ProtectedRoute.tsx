import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, sessionId } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !sessionId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;