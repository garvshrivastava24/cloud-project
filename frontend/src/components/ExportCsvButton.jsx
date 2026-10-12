import React from 'react';

/**
 * Escapes a single value for CSV output.
 * If the value contains quotes, commas, or newlines, wraps it in quotes and doubles inner quotes.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of student objects into a CSV string.
 * Columns: ID, Name, Email, Course, Semester, Registered On
 */
export function convertStudentsToCsv(students) {
  const headers = ['ID', 'Name', 'Email', 'Course', 'Semester', 'Registered On'];
  const rows = (students || []).map((s) => [
    escapeCsvValue(s.id),
    escapeCsvValue(s.name),
    escapeCsvValue(s.email),
    escapeCsvValue(s.course),
    escapeCsvValue(s.semester),
    escapeCsvValue(s.created_at || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * ExportCsvButton Component
 * Allows downloading the currently filtered students list as a students.csv file.
 * Disabled when there are no students to export.
 */
export default function ExportCsvButton({ students = [], filename = 'students.csv' }) {
  const isDisabled = !students || students.length === 0;

  const handleExport = () => {
    if (isDisabled) return;

    const csvContent = convertStudentsToCsv(students);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up created object URL
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      className="btn btn-secondary btn-export-csv"
      onClick={handleExport}
      disabled={isDisabled}
      aria-label="Export filtered students as CSV"
      title={isDisabled ? 'No students to export' : 'Download students as CSV'}
    >
      <span aria-hidden="true">📥</span> Export CSV
    </button>
  );
}
