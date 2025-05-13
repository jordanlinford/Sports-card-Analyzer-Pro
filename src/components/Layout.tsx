import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { Toaster } from 'sonner';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-gray-900">
                Sports Card Tracker
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/collection"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Collection
                  </Link>
                  <Link
                    to="/display-cases"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Display Cases
                  </Link>
                  <Link
                    to="/market-analyzer"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Market Analyzer
                  </Link>
                  <Link
                    to="/trade-analyzer"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Trade Analyzer
                  </Link>
                  <Link
                    to="/profile"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 