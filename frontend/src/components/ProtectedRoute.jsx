import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from './Loading';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Vérification de l'authentification..." />;
  }

  if (!isLoggedIn) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to their dashboard if they don't have access
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}
