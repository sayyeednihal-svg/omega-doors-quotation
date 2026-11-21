import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (u === 'omega' && p === 'omega') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Brand Identity Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 bg-white rounded-xl p-3 mb-6">
              <img
                src="/assets/quotation/omega-logo.jpg"
                alt="Omega Doors Industries"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
              <img
                src="/assets/quotation/apl-apollo-logo.jpg"
                alt="APL Apollo Doors and Windows"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-balance">
              Quotation Generator
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Create, calculate, and export 5-page material quotations for UPVC windows with technical elevation drawings and GST pricing.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Omega Doors Industries</p>
            <p>Talwade, Pimpri Chinchwad, Pune 411062</p>
            <p className="font-mono">+91 9225537971</p>
          </div>
        </div>

        {/* Sign-In Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sign in to continue</h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter your Omega staff credentials to start a new quotation.
              </p>
            </div>
            <PWAInstallButton />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter username"
                  className="w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full min-h-[46px] pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-r-xl"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] mt-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
