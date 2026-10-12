import React, { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';

export default function StudentTable({
  students = [],
  onEdit,
  onDelete,
  onViewDetails,
  hasActiveFilters = false,
  onClearFilters,
  pageSize = 10,
}) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Requirement: Reset to page 1 whenever search/filter changes (i.e. students list changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [students]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    if (!sortField) return students;
    return [...students].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'semester' || sortField === 'id') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  // Guarantee currentPage stays within valid bounds
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedStudents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedStudents.slice(startIndex, startIndex + pageSize);
  }, [sortedStudents, safeCurrentPage, pageSize]);

  if (students.length === 0) {
    return (
      <div className="table-card">
        <div className="state-container">
          <div className="state-icon" aria-hidden="true">
            {hasActiveFilters ? '🔍' : '📋'}
          </div>
          <h3>{hasActiveFilters ? 'No matching students found' : 'No students found'}</h3>
          <p>
            {hasActiveFilters
              ? 'No student records match the active search criteria or filters.'
              : 'There are no students matching your criteria, or no students have been added yet.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClearFilters}
              style={{ marginTop: '0.75rem' }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <span className="sort-indicator sort-idle" aria-hidden="true"> ↕</span>;
    }
    return (
      <span className="sort-indicator sort-active" aria-hidden="true">
        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
      </span>
    );
  };

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="students-table" aria-label="Student Directory">
          <thead>
            <tr>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => handleSort('id')}
                  aria-label={`Sort by ID, current direction ${sortField === 'id' ? sortDirection : 'none'}`}
                >
                  ID {renderSortIndicator('id')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => handleSort('name')}
                  aria-label={`Sort by Name, current direction ${sortField === 'name' ? sortDirection : 'none'}`}
                >
                  Student Name {renderSortIndicator('name')}
                </button>
              </th>
              <th scope="col">Email Address</th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => handleSort('course')}
                  aria-label={`Sort by Course, current direction ${sortField === 'course' ? sortDirection : 'none'}`}
                >
                  Course {renderSortIndicator('course')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => handleSort('semester')}
                  aria-label={`Sort by Semester, current direction ${sortField === 'semester' ? sortDirection : 'none'}`}
                >
                  Semester {renderSortIndicator('semester')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => handleSort('created_at')}
                  aria-label={`Sort by Creation Date, current direction ${sortField === 'created_at' ? sortDirection : 'none'}`}
                >
                  Enrolled On {renderSortIndicator('created_at')}
                </button>
              </th>
              <th scope="col" className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => (
              <tr key={student.id}>
                <td className="cell-id">
                  <span className="id-badge">#{student.id}</span>
                </td>
                <td className="cell-name">
                  {onViewDetails ? (
                    <button
                      type="button"
                      className="student-name-link"
                      onClick={() => onViewDetails(student)}
                      title={`View details for ${student.name}`}
                    >
                      {student.name}
                    </button>
                  ) : (
                    <span className="student-name-text">{student.name}</span>
                  )}
                </td>
                <td className="cell-email">
                  <span className="email-text">{student.email}</span>
                </td>
                <td className="cell-course">
                  <span className="course-pill">{student.course}</span>
                </td>
                <td className="cell-semester">
                  <span className="semester-badge">Sem {student.semester}</span>
                </td>
                <td className="cell-date">
                  <span className="date-text">{student.created_at || 'N/A'}</span>
                </td>
                <td className="cell-actions">
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(student)}
                      aria-label={`Edit ${student.name}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(student)}
                      aria-label={`Delete ${student.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={sortedStudents.length}
        pageSize={pageSize}
      />
    </div>
  );
}
