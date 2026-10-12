import React from 'react';

/**
 * Sidebar — Main navigation panel for the EduManager dashboard.
 *
 * Props:
 *   - currentView: 'dashboard' | 'students' — controls which nav item is highlighted
 *   - onViewChange: callback(viewName) — called when a nav item is clicked
 *   - onLogout: callback — called when the Log Out button is clicked
 *   - studentCount: optional number of students to show as badge on Students nav item
 */
export default function Sidebar({ currentView = 'dashboard', onViewChange, onLogout, studentCount }) {
  return (
    <aside className="dashboard-sidebar" aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="brand-logo" aria-hidden="true">🎓</div>
        <div className="brand-text">
          <span className="brand-title">EduManager</span>
          <span className="brand-subtitle">CI/CD System</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange && onViewChange('dashboard')}
          aria-current={currentView === 'dashboard' ? 'page' : undefined}
          title="Go to Dashboard"
        >
          <span className="nav-icon" aria-hidden="true">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'students' ? 'active' : ''}`}
          onClick={() => onViewChange && onViewChange('students')}
          aria-current={currentView === 'students' ? 'page' : undefined}
          title="Go to Student Directory"
        >
          <span className="nav-icon" aria-hidden="true">👥</span>
          <span className="nav-label">Students</span>
          {typeof studentCount === 'number' && (
            <span className="nav-badge" aria-label={`${studentCount} students`}>
              {studentCount > 99 ? '99+' : studentCount}
            </span>
          )}
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
            aria-label="Log out of Administrator session"
            title="Log out of Administrator session"
          >
            <span aria-hidden="true">↪</span> Log Out
          </button>
        )}
      </div>
    </aside>
  );
}
