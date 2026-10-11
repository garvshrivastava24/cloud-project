import React from 'react';

export default function RecentEnrollmentsTable({ students = [], onViewAllStudents, onEdit }) {
  // Take the 5 most recent students
  const recentStudents = [...students].slice(0, 5);

  return (
    <div className="recent-enrollments-card">
      <div className="recent-header">
        <div>
          <h3 className="recent-title">Recent Enrollments</h3>
          <p className="recent-subtitle">Latest student registrations in the system</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onViewAllStudents}
          aria-label="View all students in directory"
        >
          View All Students →
        </button>
      </div>

      {recentStudents.length === 0 ? (
        <div className="state-container state-compact">
          <p>No student enrollments found yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="students-table recent-table" aria-label="Recent Enrollments Summary">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Student Name</th>
                <th scope="col">Email</th>
                <th scope="col">Course</th>
                <th scope="col">Semester</th>
                <th scope="col">Enrolled On</th>
                <th scope="col" className="th-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((student) => (
                <tr key={student.id}>
                  <td className="cell-id">
                    <span className="id-badge">#{student.id}</span>
                  </td>
                  <td className="cell-name">
                    <span className="student-name-text">{student.name}</span>
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
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(student)}
                      aria-label={`Edit ${student.name}`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
