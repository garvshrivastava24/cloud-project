import React from 'react';

/**
 * Pagination Component
 * Renders Previous / Next buttons and "Page X of Y" info text.
 * Simple, accessible, and beginner-friendly.
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="pagination-bar" aria-label="Student Table Pagination">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalItems}</strong> students
        {' '}(<span className="pagination-page-label">Page {currentPage} of {totalPages}</span>)
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-pagination"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          ← Previous
        </button>

        <span className="pagination-page-pill" aria-current="page">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm btn-pagination"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          Next →
        </button>
      </div>
    </nav>
  );
}
