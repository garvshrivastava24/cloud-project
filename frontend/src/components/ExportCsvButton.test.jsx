import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExportCsvButton, { convertStudentsToCsv } from './ExportCsvButton';

describe('ExportCsvButton Component & Utility', () => {
  const sampleStudents = [
    {
      id: 1,
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      course: 'Computer Science',
      semester: 6,
      created_at: '2026-10-10 10:00:00',
    },
    {
      id: 2,
      name: 'Patel, Priya "P"',
      email: 'priya@example.com',
      course: 'Information Technology, B.Tech',
      semester: 4,
      created_at: '2026-10-11 12:30:00',
    },
  ];

  let createObjectURLMock;
  let revokeObjectURLMock;

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/mock-csv-url');
    revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly converts student records to escaped CSV string format', () => {
    const csv = convertStudentsToCsv(sampleStudents);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe('ID,Name,Email,Course,Semester,Registered On');
    expect(lines[1]).toBe('1,Aarav Sharma,aarav@example.com,Computer Science,6,2026-10-10 10:00:00');
    // Checks comma and quotation mark escaping
    expect(lines[2]).toBe('2,"Patel, Priya ""P""",priya@example.com,"Information Technology, B.Tech",4,2026-10-11 12:30:00');
  });

  it('renders disabled button when students array is empty', () => {
    render(<ExportCsvButton students={[]} />);
    const btn = screen.getByRole('button', { name: /export filtered students as csv/i });
    expect(btn).toBeDisabled();
  });

  it('renders enabled button when students exist', () => {
    render(<ExportCsvButton students={sampleStudents} />);
    const btn = screen.getByRole('button', { name: /export filtered students as csv/i });
    expect(btn).toBeEnabled();
  });

  it('triggers download and calls URL.createObjectURL and URL.revokeObjectURL on click', () => {
    // Mock HTMLAnchorElement.prototype.click to prevent JSDOM navigation warning
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ExportCsvButton students={sampleStudents} filename="custom_students.csv" />);
    const btn = screen.getByRole('button', { name: /export filtered students as csv/i });

    fireEvent.click(btn);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/mock-csv-url');

    clickSpy.mockRestore();
  });
});
