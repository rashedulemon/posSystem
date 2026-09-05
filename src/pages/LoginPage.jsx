import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [errorMsg, setErrorMsg] = useState('');

  // If user is already logged in, redirect immediately to POS main page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      await login(email, password, role);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    }
  };

  const handleDemoLogin = async (selectedRole) => {
    try {
      setRole(selectedRole);
      await login(
        selectedRole === 'admin' ? 'admin@pos.shop' : 'cashier@pos.shop',
        'password',
        selectedRole
      );
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700/70 space-y-6">
        
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Aura POS Register</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sign in to access sales register, inventory & analytics
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block text-center">
            Quick One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login as Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('cashier')}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-gray-100 transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login as Cashier</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-3 text-xs text-gray-400">or sign in with email</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@pos.shop"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-medium text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center space-x-2"
          >
            <span>Sign In to POS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
