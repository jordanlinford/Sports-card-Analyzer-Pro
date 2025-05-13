import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoIcon from '@/assets/logos/logo-icon.png';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const location = useLocation();
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
    <nav className="w-full bg-white dark:bg-background-dark shadow-md px-4 py-2 flex items-center justify-between">
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2">
        <img src={LogoIcon} alt="Sports Card Analyzer Logo" className="h-10 w-10" />
        <span className="hidden sm:block font-heading text-2xl text-primary tracking-wide">Sports Card Analyzer</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-4 ml-8 items-center">
        <NavLink to="/dashboard" label="Dashboard" active={location.pathname === '/dashboard'} />
        <NavLink to="/collection" label="Collection" active={location.pathname === '/collection'} />
        <NavLink to="/display-cases" label="Display Cases" active={location.pathname.startsWith('/display-cases')} />
        <NavLink to="/market-analyzer" label="Market Analyzer" active={location.pathname === '/market-analyzer'} />
        <NavLink to="/trade-analyzer" label="Trade Analyzer" active={location.pathname.startsWith('/trade-analyzer')} />
        {user && <NavLink to="/profile" label="Profile" active={location.pathname === '/profile'} />}
      </div>

      {/* Right Side: Theme Toggle & Auth */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Placeholder */}
        <button className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-secondary transition-colors" aria-label="Toggle theme">
          <svg className="h-6 w-6 text-primary dark:text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71" />
          </svg>
        </button>
        {/* Auth/Profile */}
        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-900 font-bold px-3 py-1 rounded-2xl bg-red-50 dark:bg-red-900/20"
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`font-body text-lg px-3 py-1 rounded-2xl transition-colors ${
        active
          ? 'bg-primary text-white dark:bg-secondary dark:text-background-dark'
          : 'text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/20'
      }`}
    >
      {label}
    </Link>
  );
} 