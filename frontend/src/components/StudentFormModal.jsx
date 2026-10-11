import React, { useRef, useEffect } from 'react';

export default function StudentFormModal({
  isOpen,
  student,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    course: '',
    semester: '1',
  });
  const [errors, setErrors] = React.useState({});
  const nameInputRef = useRef(null);

  // Prepopulate form when editing or clear when adding
  React.useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        course: student.course || '',
        semester: String(student.semester || '1'),
      });
    } else {
      setFormData({
        name: '',
        email: '',
        course: '',
        semester: '1',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  // Focus the first input field upon modal open
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Accessibility: close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g., student@college.edu).';
    }
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required.';
    }
    const sem = Number(formData.semester);
    if (!sem || sem < 1 || sem > 8) {
      newErrors.semester = 'Semester must be between 1 and 8.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submissions
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      course: formData.course.trim(),
      semester: Number(formData.semester),
    });
  };

  const isEditMode = Boolean(student && student.id);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="modal-title">{isEditMode ? 'Edit Student Record' : 'Add New Student'}</h2>
            <p className="modal-subtitle">
              {isEditMode
                ? 'Update academic and contact information for this student.'
                : 'Enter student academic details to register them in the system.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="student-name">
                Full Name <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="student-name"
                name="name"
                type="text"
                placeholder="e.g. Garv Shrivastava"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'student-name-error' : undefined}
                required
              />
              {errors.name && (
                <p id="student-name-error" className="form-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="student-email">
                Email Address <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                id="student-email"
                name="email"
                type="email"
                placeholder="e.g. garv@example.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'student-email-error' : undefined}
                required
              />
              {errors.email && (
                <p id="student-email-error" className="form-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="student-course">
                Enrolled Course / Department <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                id="student-course"
                name="course"
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.course}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.course)}
                aria-describedby={errors.course ? 'student-course-error' : undefined}
                required
              />
              {errors.course && (
                <p id="student-course-error" className="form-error">
                  {errors.course}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="student-semester">
                Current Semester <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <select
                id="student-semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.semester)}
                aria-describedby={errors.semester ? 'student-semester-error' : undefined}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p id="student-semester-error" className="form-error">
                  {errors.semester}
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
