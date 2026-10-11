import React, { useRef, useEffect } from 'react';

export default function DeleteConfirmModal({
  isOpen,
  student,
  onClose,
  onConfirm,
  isDeleting,
}) {
  const cancelBtnRef = useRef(null);

  // Focus cancel button upon modal opening for safe keyboard navigation
  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Accessibility: close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !student) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="modal-dialog modal-dialog-danger">
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="delete-dialog-title">Confirm Record Deletion</h2>
            <p className="modal-subtitle">Permanent action</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning-box">
            <div className="warning-icon" aria-hidden="true">⚠️</div>
            <div>
              <p>
                Are you sure you want to delete student{' '}
                <strong>{student.name}</strong> (ID: #{student.id})?
              </p>
              <p className="delete-details-text">
                Enrolled Course: <strong>{student.course}</strong> &bull; Semester {student.semester}
              </p>
            </div>
          </div>
          <p className="delete-note">
            This action immediately removes the record from the local SQLite database and cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(student.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="btn-spinner" aria-hidden="true"></span>
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
