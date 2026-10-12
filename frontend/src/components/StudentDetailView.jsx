import React from 'react';

/**
 * StudentDetailView — A dedicated full-page view for a single student.
 * Shows a rich profile dashboard with all student information, stats,
 * academic details, and quick action buttons (Edit, Delete, Back).
 *
 * Props:
 *   - student: the student object { id, name, email, course, semester, created_at }
 *   - onBack: callback to return to the previous page (students list or dashboard)
 *   - onEdit: callback to open edit modal for this student
 *   - onDelete: callback to open delete confirmation for this student
 */
export default function StudentDetailView({ student, onBack, onEdit, onDelete }) {
  // If no student is provided, show a fallback message
  if (!student) {
    return (
      <div className="student-detail-page">
        <div className="detail-empty-state">
          <div className="state-icon" aria-hidden="true">📋</div>
          <h3>No Student Selected</h3>
          <p>Please select a student from the directory to view their profile.</p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            ← Back to Directory
          </button>
        </div>
      </div>
    );
  }

  // Generate avatar initials from student name (e.g. "Aarav Sharma" => "AS")
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Determine a color based on student ID for the avatar background
  const avatarColors = [
    '#2563eb', '#7c3aed', '#db2777', '#ea580c',
    '#16a34a', '#0891b2', '#4f46e5', '#c026d3',
  ];
  const avatarColor = avatarColors[(student.id || 0) % avatarColors.length];

  // Calculate academic progress based on semester (assuming 8 semesters total)
  const totalSemesters = 8;
  const progressPercent = Math.min(
    100,
    Math.round(((student.semester || 1) / totalSemesters) * 100)
  );

  // Determine academic standing label based on semester
  const getAcademicStanding = (semester) => {
    if (semester <= 2) return { label: 'Freshman', color: '#16a34a' };
    if (semester <= 4) return { label: 'Sophomore', color: '#2563eb' };
    if (semester <= 6) return { label: 'Junior', color: '#7c3aed' };
    return { label: 'Senior', color: '#ea580c' };
  };

  const standing = getAcademicStanding(student.semester);

  // Format enrollment date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Available';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate expected graduation year (rough estimate)
  const getExpectedGraduation = (semester) => {
    const remainingSemesters = totalSemesters - (semester || 1);
    const remainingYears = Math.ceil(remainingSemesters / 2);
    return new Date().getFullYear() + remainingYears;
  };

  return (
    <div className="student-detail-page">
      {/* Top breadcrumb / back navigation */}
      <div className="detail-breadcrumb">
        <button type="button" className="btn-back" onClick={onBack} aria-label="Go back to student directory">
          <span aria-hidden="true">←</span> Back to Directory
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{student.name}</span>
      </div>

      {/* Profile Hero Card */}
      <div className="detail-hero-card">
        <div className="detail-hero-content">
          {/* Large Avatar */}
          <div
            className="detail-avatar"
            style={{ backgroundColor: avatarColor }}
            aria-hidden="true"
          >
            {getInitials(student.name)}
          </div>

          {/* Student Name & Quick Info */}
          <div className="detail-hero-info">
            <h2 className="detail-student-name">{student.name}</h2>
            <p className="detail-student-email">{student.email}</p>
            <div className="detail-badges-row">
              <span className="detail-badge detail-badge-course">
                📚 {student.course}
              </span>
              <span className="detail-badge detail-badge-semester">
                🎓 Semester {student.semester}
              </span>
              <span
                className="detail-badge detail-badge-standing"
                style={{ backgroundColor: standing.color + '20', color: standing.color, borderColor: standing.color + '40' }}
              >
                {standing.label}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="detail-hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onEdit(student)}
              aria-label={`Edit ${student.name}`}
            >
              ✏️ Edit Student
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onDelete(student)}
              aria-label={`Delete ${student.name}`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="detail-cards-grid">

        {/* Personal Information Card */}
        <div className="detail-info-card">
          <div className="detail-card-header">
            <span className="detail-card-icon" aria-hidden="true">👤</span>
            <h3 className="detail-card-title">Personal Information</h3>
          </div>
          <div className="detail-card-body">
            <div className="detail-info-row">
              <span className="detail-info-label">Full Name</span>
              <span className="detail-info-value">{student.name}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Email Address</span>
              <span className="detail-info-value detail-info-email">{student.email}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Student ID</span>
              <span className="detail-info-value">
                <span className="id-badge">#{student.id}</span>
              </span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Status</span>
              <span className="detail-info-value">
                <span className="detail-status-active">● Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Academic Information Card */}
        <div className="detail-info-card">
          <div className="detail-card-header">
            <span className="detail-card-icon" aria-hidden="true">🎓</span>
            <h3 className="detail-card-title">Academic Information</h3>
          </div>
          <div className="detail-card-body">
            <div className="detail-info-row">
              <span className="detail-info-label">Course / Program</span>
              <span className="detail-info-value">
                <span className="course-pill">{student.course}</span>
              </span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Current Semester</span>
              <span className="detail-info-value">
                <span className="semester-badge">Semester {student.semester}</span>
              </span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Academic Standing</span>
              <span className="detail-info-value">
                <span
                  className="detail-standing-pill"
                  style={{ backgroundColor: standing.color + '15', color: standing.color }}
                >
                  {standing.label}
                </span>
              </span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Expected Graduation</span>
              <span className="detail-info-value">{getExpectedGraduation(student.semester)}</span>
            </div>
          </div>
        </div>

        {/* Academic Progress Card */}
        <div className="detail-info-card">
          <div className="detail-card-header">
            <span className="detail-card-icon" aria-hidden="true">📊</span>
            <h3 className="detail-card-title">Academic Progress</h3>
          </div>
          <div className="detail-card-body">
            <div className="detail-progress-section">
              <div className="detail-progress-header">
                <span className="detail-progress-label">
                  Semester {student.semester} of {totalSemesters}
                </span>
                <span className="detail-progress-percent">{progressPercent}%</span>
              </div>
              <div className="detail-progress-bar-bg">
                <div
                  className="detail-progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Academic progress: ${progressPercent}%`}
                />
              </div>
              <p className="detail-progress-note">
                {progressPercent >= 100
                  ? '🎉 Final semester! Graduation is near.'
                  : progressPercent >= 75
                    ? '🔥 Almost there! Keep up the great work.'
                    : progressPercent >= 50
                      ? '📈 Halfway through the program. Great progress!'
                      : '🌱 Early stages of the academic journey.'}
              </p>
            </div>

            {/* Semester Timeline Visual */}
            <div className="detail-semester-timeline">
              {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
                <div
                  key={sem}
                  className={`detail-sem-dot ${
                    sem < student.semester
                      ? 'completed'
                      : sem === student.semester
                        ? 'current'
                        : 'upcoming'
                  }`}
                  title={
                    sem < student.semester
                      ? `Semester ${sem} — Completed`
                      : sem === student.semester
                        ? `Semester ${sem} — Current`
                        : `Semester ${sem} — Upcoming`
                  }
                >
                  <span className="sem-dot-number">{sem}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Details Card */}
        <div className="detail-info-card">
          <div className="detail-card-header">
            <span className="detail-card-icon" aria-hidden="true">📅</span>
            <h3 className="detail-card-title">Enrollment Details</h3>
          </div>
          <div className="detail-card-body">
            <div className="detail-info-row">
              <span className="detail-info-label">Enrollment Date</span>
              <span className="detail-info-value">{formatDate(student.created_at)}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Registration ID</span>
              <span className="detail-info-value">REG-{String(student.id).padStart(4, '0')}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Department</span>
              <span className="detail-info-value">{student.course}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-info-label">Enrollment Status</span>
              <span className="detail-info-value">
                <span className="detail-status-active">● Currently Enrolled</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
