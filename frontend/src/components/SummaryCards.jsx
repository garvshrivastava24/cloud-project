import React from 'react';

export default function SummaryCards({ students = [] }) {
  // Metric 1: Total students
  const totalStudents = students.length;

  // Metric 2: Distinct courses
  const distinctCourses = React.useMemo(() => {
    const courseSet = new Set(
      students.map((s) => (s.course || '').trim()).filter(Boolean)
    );
    return courseSet.size;
  }, [students]);

  // Metric 3: Distinct semesters represented
  const distinctSemesters = React.useMemo(() => {
    const semSet = new Set(
      students.map((s) => Number(s.semester)).filter((n) => Number.isInteger(n) && n > 0)
    );
    return semSet.size;
  }, [students]);

  // Metric 4: Latest / Recently added student (derived reliably using creation timestamp and id)
  const recentStudent = React.useMemo(() => {
    if (students.length === 0) return null;
    return [...students].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA && !isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA;
      }
      return (b.id || 0) - (a.id || 0);
    })[0];
  }, [students]);

  return (
    <section className="summary-grid" aria-label="Student Overview Metrics">
      <div className="stat-card" data-testid="card-total-students">
        <div className="stat-header">
          <span className="stat-label">Total Students</span>
          <div className="stat-icon-wrap stat-icon-blue" aria-hidden="true">
            👥
          </div>
        </div>
        <div className="stat-value">{totalStudents}</div>
        <div className="stat-footer">
          <span className="stat-detail">Enrolled in system</span>
        </div>
      </div>

      <div className="stat-card" data-testid="card-distinct-courses">
        <div className="stat-header">
          <span className="stat-label">Active Courses</span>
          <div className="stat-icon-wrap stat-icon-emerald" aria-hidden="true">
            📚
          </div>
        </div>
        <div className="stat-value">{distinctCourses}</div>
        <div className="stat-footer">
          <span className="stat-detail">Distinct programs offered</span>
        </div>
      </div>

      <div className="stat-card" data-testid="card-distinct-semesters">
        <div className="stat-header">
          <span className="stat-label">Active Semesters</span>
          <div className="stat-icon-wrap stat-icon-indigo" aria-hidden="true">
            🗓️
          </div>
        </div>
        <div className="stat-value">{distinctSemesters}</div>
        <div className="stat-footer">
          <span className="stat-detail">Semesters represented (1–8)</span>
        </div>
      </div>

      <div className="stat-card" data-testid="card-recent-student">
        <div className="stat-header">
          <span className="stat-label">Latest Enrolled</span>
          <div className="stat-icon-wrap stat-icon-amber" aria-hidden="true">
            ✨
          </div>
        </div>
        <div className="stat-value stat-value-sm">
          {recentStudent ? recentStudent.name : 'None'}
        </div>
        <div className="stat-footer">
          <span className="stat-detail">
            {recentStudent ? (recentStudent.course || 'Enrolled') : 'No records yet'}
          </span>
        </div>
      </div>
    </section>
  );
}
