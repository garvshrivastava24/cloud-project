import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import StudentFormModal from './components/StudentFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { api } from './api';

// Mock the API module so frontend unit tests execute with predictable data
vi.mock('./api', () => ({
  api: {
    checkHealth: vi.fn(),
    getStudents: vi.fn(),
    getStudentById: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

const mockStudents = [
  {
    id: 1,
    name: 'Aarav Sharma',
    email: 'aarav@example.edu',
    course: 'Computer Science',
    semester: 6,
    created_at: '2026-10-11 12:00:00',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya@example.edu',
    course: 'Information Technology',
    semester: 4,
    created_at: '2026-10-11 12:05:00',
  },
  {
    id: 3,
    name: 'Rohan Verma',
    email: 'rohan@example.edu',
    course: 'Computer Science',
    semester: 8,
    created_at: '2026-10-11 12:10:00',
  },
];

describe('Student Management System - Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';
  });

  // 1. Dashboard and summary cards render
  it('renders dashboard layout, sidebar, header, and 4 summary cards', async () => {
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    expect(screen.getByText('Student Management System')).toBeInTheDocument();
    expect(screen.getByText('Student Overview')).toBeInTheDocument();
    expect(screen.getByText('EduManager')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Recent Enrollments')).toBeInTheDocument();
      // 4 Summary cards
      expect(screen.getByTestId('card-total-students')).toHaveTextContent('3');
      expect(screen.getByTestId('card-distinct-courses')).toHaveTextContent('2'); // Computer Science, Information Technology
      expect(screen.getByTestId('card-distinct-semesters')).toHaveTextContent('3'); // 4, 6, 8
      expect(screen.getByTestId('card-recent-student')).toHaveTextContent('Rohan Verma');
    });
  });

  // 2. Navigation between Dashboard and Students directory
  it('navigates between Dashboard and Students pages when clicking sidebar items', async () => {
    api.getStudents.mockResolvedValue({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Student Overview')).toBeInTheDocument();
    });

    // Check active navigation item is Dashboard
    const dashboardBtn = screen.getByRole('button', { name: /^dashboard$/i });
    const studentsBtn = screen.getByRole('button', { name: /^students$/i });
    expect(dashboardBtn).toHaveClass('active');
    expect(studentsBtn).not.toHaveClass('active');

    // Click Students in the sidebar
    fireEvent.click(studentsBtn);

    // Should switch to Student Directory page
    expect(screen.getByRole('heading', { name: 'Student Directory', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Students')).toBeInTheDocument();
    expect(studentsBtn).toHaveClass('active');
    expect(dashboardBtn).not.toHaveClass('active');
    expect(window.location.hash).toBe('#/students');

    // Click Dashboard in the sidebar
    fireEvent.click(dashboardBtn);

    // Should switch back to Dashboard overview
    expect(screen.getByText('Student Overview')).toBeInTheDocument();
    expect(dashboardBtn).toHaveClass('active');
    expect(studentsBtn).not.toHaveClass('active');
    expect(window.location.hash).toBe('#/');
  });

  // 3. Browser hash change updates view (Back/Forward / initial refresh)
  it('handles browser hash navigation for #/students and refresh', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Student Directory', level: 1 })).toBeInTheDocument();
      expect(screen.getByText('All Students')).toBeInTheDocument();
    });

    // Simulate browser back button to dashboard (#/)
    window.location.hash = '#/';
    fireEvent(window, new HashChangeEvent('hashchange'));

    await waitFor(() => {
      expect(screen.getByText('Student Overview')).toBeInTheDocument();
    });
  });

  // 4. Student data and counts render correctly in directory
  it('renders student records in directory table and counter accurately', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
      expect(screen.getByText('priya@example.edu')).toBeInTheDocument();
      expect(screen.getByText('Sem 8')).toBeInTheDocument();
      expect(screen.getByTestId('student-counter')).toHaveTextContent('Total Students: 3');
    });
  });

  // 5. Search matches names and emails without case sensitivity on Students page
  it('searches students by name or email case-insensitively', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);

    // Search by partial name uppercase
    fireEvent.change(searchInput, { target: { value: 'AARAV' } });
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Aarav Sharma');
    expect(table).not.toHaveTextContent('Priya Patel');

    // Search by partial email
    fireEvent.change(searchInput, { target: { value: 'priya@' } });
    expect(table).not.toHaveTextContent('Aarav Sharma');
    expect(table).toHaveTextContent('Priya Patel');
  });

  // 6. Course filtering works
  it('filters students by course dropdown correctly', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const courseSelect = screen.getByLabelText(/filter students by course/i);

    // Select Information Technology
    fireEvent.change(courseSelect, { target: { value: 'Information Technology' } });

    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Priya Patel');
    expect(table).not.toHaveTextContent('Aarav Sharma');
    expect(table).not.toHaveTextContent('Rohan Verma');
    expect(screen.getByTestId('student-counter')).toHaveTextContent('Showing 1 of 3 students');
  });

  // 7. Semester filtering works
  it('filters students by semester dropdown correctly', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const semSelect = screen.getByLabelText(/filter students by semester/i);

    // Select Semester 8
    fireEvent.change(semSelect, { target: { value: '8' } });

    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Rohan Verma');
    expect(table).not.toHaveTextContent('Aarav Sharma');
    expect(table).not.toHaveTextContent('Priya Patel');
  });

  // 8. Search, course, and semester filters work together (Combined filter)
  it('filters by combined search text, course, and semester', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    const courseSelect = screen.getByLabelText(/filter students by course/i);
    const semSelect = screen.getByLabelText(/filter students by semester/i);

    // Filter by Computer Science
    fireEvent.change(courseSelect, { target: { value: 'Computer Science' } });
    // Filter by Semester 6
    fireEvent.change(semSelect, { target: { value: '6' } });
    // Text search
    fireEvent.change(searchInput, { target: { value: 'aarav' } });

    // Should only match Aarav Sharma in table
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Aarav Sharma');
    expect(table).not.toHaveTextContent('Rohan Verma');
    expect(table).not.toHaveTextContent('Priya Patel');
  });

  // 9. Clearing filters restores the full student list
  it('restores all students when "Clear filters" is clicked', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const courseSelect = screen.getByLabelText(/filter students by course/i);
    fireEvent.change(courseSelect, { target: { value: 'Information Technology' } });

    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('Aarav Sharma');

    const clearBtn = screen.getByRole('button', { name: /clear all applied filters/i });
    fireEvent.click(clearBtn);

    expect(table).toHaveTextContent('Aarav Sharma');
    expect(table).toHaveTextContent('Priya Patel');
    expect(table).toHaveTextContent('Rohan Verma');
  });

  // 10. No-match searches display the correct empty state
  it('displays contextual empty state when no students match active filters', async () => {
    window.location.hash = '#/students';
    api.getStudents.mockResolvedValueOnce({
      success: true,
      count: mockStudents.length,
      data: mockStudents,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Student' } });

    expect(screen.getByText('No matching students found')).toBeInTheDocument();
    expect(screen.getByText(/no student records match the active search/i)).toBeInTheDocument();
  });

  // 11. Adding a student updates the list and summary metrics
  it('submits a new student and updates the directory and summary cards', async () => {
    window.location.hash = '#/students';
    api.getStudents
      .mockResolvedValueOnce({ success: true, count: 0, data: [] })
      .mockResolvedValueOnce({
        success: true,
        count: 1,
        data: [
          {
            id: 10,
            name: 'New Scholar',
            email: 'scholar@college.edu',
            course: 'Data Science',
            semester: 2,
            created_at: '2026-10-11',
          },
        ],
      });
    api.createStudent.mockResolvedValueOnce({
      success: true,
      data: { id: 10, name: 'New Scholar' },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No students found')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /add new student/i });
    fireEvent.click(addBtn);

    // Form modal opens
    expect(screen.getByRole('heading', { name: 'Add New Student' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'New Scholar' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'scholar@college.edu' },
    });
    fireEvent.change(screen.getByLabelText(/enrolled course/i), {
      target: { value: 'Data Science' },
    });
    fireEvent.change(screen.getByLabelText(/current semester/i), {
      target: { value: '2' },
    });

    const submitBtn = screen.getByRole('button', { name: 'Add Student' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createStudent).toHaveBeenCalledWith({
        name: 'New Scholar',
        email: 'scholar@college.edu',
        course: 'Data Science',
        semester: 2,
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('table')).toHaveTextContent('New Scholar');
    });
  });

  // 12. Editing a student updates displayed information
  it('opens edit modal and updates existing student', async () => {
    window.location.hash = '#/students';
    api.getStudents
      .mockResolvedValueOnce({ success: true, count: 1, data: [mockStudents[0]] })
      .mockResolvedValueOnce({
        success: true,
        count: 1,
        data: [{ ...mockStudents[0], name: 'Aarav Updated' }],
      });
    api.updateStudent.mockResolvedValueOnce({
      success: true,
      data: { ...mockStudents[0], name: 'Aarav Updated' },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toHaveTextContent('Aarav Sharma');
    });

    const editBtn = screen.getByRole('button', { name: /edit aarav sharma/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: 'Edit Student Record' })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toHaveValue('Aarav Sharma');

    fireEvent.change(nameInput, { target: { value: 'Aarav Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(api.updateStudent).toHaveBeenCalledWith(1, {
        name: 'Aarav Updated',
        email: 'aarav@example.edu',
        course: 'Computer Science',
        semester: 6,
      });
      expect(screen.getByRole('table')).toHaveTextContent('Aarav Updated');
    });
  });

  // 13. Deleting a student removes the record
  it('deletes a student after confirmation', async () => {
    window.location.hash = '#/students';
    api.getStudents
      .mockResolvedValueOnce({ success: true, count: 1, data: [mockStudents[0]] })
      .mockResolvedValueOnce({ success: true, count: 0, data: [] });
    api.deleteStudent.mockResolvedValueOnce({ success: true });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toHaveTextContent('Aarav Sharma');
    });

    const deleteBtn = screen.getByRole('button', { name: /delete aarav sharma/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: 'Confirm Record Deletion' })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Delete Record' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteStudent).toHaveBeenCalledWith(1);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByText('No students found')).toBeInTheDocument();
    });
  });

  // 14. Form validation works
  it('validates form inputs before submission', () => {
    const handleSubmit = vi.fn();
    render(
      <StudentFormModal
        isOpen={true}
        student={null}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    expect(screen.getByText('Student name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Course is required.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  // 15. API failures produce understandable feedback
  it('displays error notification when API fails', async () => {
    api.getStudents.mockRejectedValueOnce(new Error('Network error or server offline'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Network error or server offline')).toBeInTheDocument();
    });
  });

  // 16. Modal dismissal with Escape key
  it('dismisses modal dialog when pressing Escape key', () => {
    const handleClose = vi.fn();
    render(
      <StudentFormModal
        isOpen={true}
        student={null}
        onClose={handleClose}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
