import React from 'react'

export default function Header({ currentPage, onNavigate }) {
  const isLoggedIn = currentPage === 'dashboard'

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
          <span className="brand-dot" /> LifeShare Blood Bank
        </div>

        <nav className="nav">
          {isLoggedIn ? (
            <button className="nav-button" onClick={() => onNavigate('home')} type="button">
              Log out
            </button>
          ) : (
            <button
              className={currentPage === 'auth' ? 'nav-button active' : 'nav-button'}
              onClick={() => onNavigate('auth')}
              type="button"
            >
              Login / Sign Up
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
