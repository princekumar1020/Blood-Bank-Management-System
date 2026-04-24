import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="brand" role="button" tabIndex={0}>
          <span className="brand-dot" /> LifeShare Blood Bank
        </Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}>
                Dashboard
              </NavLink>
              <Link to="/auth" onClick={logout} className="nav-button">
                Logout
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}>
                Home
              </NavLink>
              <NavLink to="/auth" className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}>
                Login / Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}