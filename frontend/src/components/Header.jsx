import React from 'react';

export default function Header({ currentView = 'dashboard', currentUser, onLogout }) {
  const isStudents = currentView === 'students';
  const displayName = currentUser?.name || 'College Admin';
  const displayRole = currentUser?.role || 'Administrator';
  const displayInitials = currentUser?.avatarInitials || 'AD';

  return (
    <header className="dashboard-topbar">
      <div className="topbar-page-title">
        <h1 className="topbar-heading">
          {isStudents ? 'Student Directory' : 'Student Management System'}
        </h1>
        <span className="topbar-env-tag">
          {isStudents ? 'Directory View' : 'Overview & Analytics'}
        </span>
      </div>

      <div className="topbar-user-group">
        <div className="topbar-user">
          <div className="user-avatar" aria-hidden="true">
            <span>{displayInitials}</span>
          </div>
          <div className="user-meta">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>
        </div>
        {onLogout && (
          <button
            type="button"
            className="btn-header-logout"
            onClick={onLogout}
            title="Log out of Administrator session"
            aria-label="Logout"
          >
            <span className="logout-icon" aria-hidden="true">⏻</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
