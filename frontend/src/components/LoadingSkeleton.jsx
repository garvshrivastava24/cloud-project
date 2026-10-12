import React from 'react';

/**
 * LoadingSkeleton Component
 * Provides clean, CSS-animated placeholder rows for tables and placeholder
 * blocks for cards while student data is loading asynchronously.
 */
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="table-card table-skeleton-container" data-testid="table-loading-skeleton" aria-label="Loading student records">
      <div className="table-responsive">
        <table className="students-table skeleton-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Student Name</th>
              <th scope="col">Email Address</th>
              <th scope="col">Course</th>
              <th scope="col">Semester</th>
              <th scope="col">Enrolled On</th>
              <th scope="col" className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="skeleton-row">
                <td><div className="skeleton-block skeleton-id" /></td>
                <td><div className="skeleton-block skeleton-text" style={{ width: '70%' }} /></td>
                <td><div className="skeleton-block skeleton-text" style={{ width: '85%' }} /></td>
                <td><div className="skeleton-block skeleton-pill" /></td>
                <td><div className="skeleton-block skeleton-badge" /></td>
                <td><div className="skeleton-block skeleton-text" style={{ width: '55%' }} /></td>
                <td><div className="skeleton-block skeleton-btn" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <section className="summary-grid" data-testid="cards-loading-skeleton" aria-label="Loading summary metrics">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="stat-card skeleton-stat-card">
          <div className="stat-header">
            <div className="skeleton-block" style={{ width: '45%', height: '14px' }} />
            <div className="skeleton-block skeleton-icon" />
          </div>
          <div className="skeleton-block skeleton-val" />
          <div className="stat-footer">
            <div className="skeleton-block" style={{ width: '65%', height: '12px' }} />
          </div>
        </div>
      ))}
    </section>
  );
}
