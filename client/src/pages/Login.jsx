import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { user, loginUser, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    clearError();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Basic Validations
    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white animate-pulse-slow">
            Sign in to ResumeAI
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze and polish your resumes with AI
          </p>
        </div>

        {/* Dynamic Alerts */}
        {(localError || authError) && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-950/20 border border-rose-500/30 p-4 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{localError || authError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email Address */}
          <div>
            <label htmlFor="email-address" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-sm focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
            <div className="relative mt-1.5 rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-10 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-sm focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              id="btn-login-submit"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors" id="link-register">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
