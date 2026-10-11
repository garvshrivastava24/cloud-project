import React from 'react';

export default function FilterToolbar({
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  selectedSemester,
  onSemesterChange,
  availableCourses,
  onClearFilters,
  hasActiveFilters,
  totalCount,
  filteredCount,
  onOpenAddModal,
}) {
  return (
    <div className="filter-panel" aria-label="Search and Filter Controls">
      <div className="filter-row-primary">
        <div className="search-group">
          <label htmlFor="search-students" className="sr-only">
            Search students by name or email
          </label>
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              id="search-students"
              type="search"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search students by name or email"
            />
          </div>
        </div>

        <div className="actions-group">
          <button
            type="button"
            className="btn btn-primary btn-add"
            onClick={onOpenAddModal}
            aria-label="Add new student"
          >
            <span aria-hidden="true">＋</span> Add Student
          </button>
        </div>
      </div>

      <div className="filter-row-secondary">
        <div className="select-filters">
          <div className="filter-select-wrapper">
            <label htmlFor="filter-course" className="filter-label">
              Course:
            </label>
            <select
              id="filter-course"
              className="filter-select"
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              aria-label="Filter students by course"
            >
              <option value="">All courses</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-semester" className="filter-label">
              Semester:
            </label>
            <select
              id="filter-semester"
              className="filter-select"
              value={selectedSemester}
              onChange={(e) => onSemesterChange(e.target.value)}
              aria-label="Filter students by semester"
            >
              <option value="">All semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-clear"
              onClick={onClearFilters}
              aria-label="Clear all applied filters"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        <div className="results-counter" aria-live="polite">
          <span className="counter-pill" data-testid="student-counter">
            {hasActiveFilters ? (
              <>
                Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> students
              </>
            ) : (
              <>
                Total Students: <strong>{totalCount}</strong>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
