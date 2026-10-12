import React from 'react';

export default function Sidebar({ currentView = 'dashboard', onViewChange, onLogout }) {
  return (
    <aside className="dashboard-sidebar" aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="brand-logo" aria-hidden="true">🎓</div>
        <div className="brand-text">
          <span className="brand-title">EduManager</span>
          <span className="brand-subtitle">CI/CD System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange && onViewChange('dashboard')}
          aria-current={currentView === 'dashboard' ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'students' ? 'active' : ''}`}
          onClick={() => onViewChange && onViewChange('students')}
          aria-current={currentView === 'students' ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">👥</span>
          <span className="nav-label">Students</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="system-pill">
          <span className="system-status-dot" aria-hidden="true"></span>
          <span>CI Pipeline Active</span>
        </div>

        {onLogout && (
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Log out of Administrator session"
          >
            <span aria-hidden="true">↪</span> Log Out
          </button>
        )}
      </div>
    </aside>
  );
}
