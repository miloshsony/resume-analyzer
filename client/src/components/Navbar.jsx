import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Menu, X, ShieldAlert, History as HistoryIcon, UploadCloud, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90" id="brand-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">ResumeAI</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')} id="nav-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/upload" className={linkClass('/upload')} id="nav-upload">
                    <UploadCloud className="h-4 w-4" />
                    Upload & Analyze
                  </Link>
                  <Link to="/history" className={linkClass('/history')} id="nav-history">
                    <HistoryIcon className="h-4 w-4" />
                    History
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={linkClass('/admin')} id="nav-admin">
                      <ShieldAlert className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}

                  {/* Profile & Logout Section */}
                  <div className="ml-4 flex items-center gap-4 border-l border-slate-800 pl-4">
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-950/30 hover:border-rose-500/30"
                      id="btn-logout"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    id="nav-login"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
                    id="nav-register"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-950 hover:text-white"
              aria-label="Toggle menu"
              id="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 px-2 py-3 space-y-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 rounded-md"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 rounded-md"
              >
                <UploadCloud className="h-5 w-5" />
                Upload & Analyze
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 rounded-md"
              >
                <HistoryIcon className="h-5 w-5" />
                History
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-400 hover:bg-slate-900 rounded-md"
                >
                  <ShieldAlert className="h-5 w-5" />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-slate-900 pt-4 mt-2 px-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{user.name}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-950/20 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 px-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 border border-slate-800 rounded-md text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-blue-600 rounded-md text-sm font-bold text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
