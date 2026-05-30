import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
          {/* Main Navigation */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-1">
            <Routes>
              {/* Authenticated Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          {/* Footer Component */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p>© {new Date().getFullYear()} ResumeAI. Engineered using MERN & Google Gemini AI API.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
