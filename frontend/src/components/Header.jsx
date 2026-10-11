import React from 'react';

export default function Header({ currentView = 'dashboard' }) {
  const isStudents = currentView === 'students';

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

      <div className="topbar-user">
        <div className="user-avatar" aria-hidden="true">
          <span>AD</span>
        </div>
        <div className="user-meta">
          <span className="user-name">College Admin</span>
          <span className="user-role">Administrator</span>
        </div>
      </div>
    </header>
  );
}
