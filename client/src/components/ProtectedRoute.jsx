import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" id="loading-spinner"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">Loading your profile session...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to Login
  if (!user) {
    console.log('Access denied. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (like 'admin'), check and restrict
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`RBAC Warning: User ${user.email} with role '${user.role}' tried to access '${requiredRole}' resource.`);
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required credentials
  return children;
};

export default ProtectedRoute;
