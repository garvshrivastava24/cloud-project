import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudentDetailView from './StudentDetailView';

// Sample student object used across tests
const mockStudent = {
  id: 1,
  name: 'Aarav Sharma',
  email: 'aarav@example.edu',
  course: 'Computer Science',
  semester: 6,
  created_at: '2026-10-11 12:00:00',
};

// Default callback stubs
const defaultProps = {
  student: mockStudent,
  onBack: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('StudentDetailView Component', () => {
  // 1. Empty state when no student is provided
  it('displays empty state with back button when no student is provided', () => {
    const onBack = vi.fn();
    render(<StudentDetailView student={null} onBack={onBack} onEdit={vi.fn()} onDelete={vi.fn()} />);

    // Should show the "No Student Selected" message
    expect(screen.getByText('No Student Selected')).toBeInTheDocument();
    expect(screen.getByText('Please select a student from the directory to view their profile.')).toBeInTheDocument();

    // Clicking the back button should call onBack
    const backBtn = screen.getByText('← Back to Directory');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // 2. Renders student name and email in hero section
  it('renders student name and email in the hero card', () => {
    render(<StudentDetailView {...defaultProps} />);

    // Name appears in both breadcrumb + hero + detail card, email in hero + detail card
    const nameEls = screen.getAllByText('Aarav Sharma');
    expect(nameEls.length).toBeGreaterThanOrEqual(1);
    const emailEls = screen.getAllByText('aarav@example.edu');
    expect(emailEls.length).toBeGreaterThanOrEqual(1);
  });

  // 3. Shows correct avatar initials
  it('displays correct avatar initials from student name', () => {
    render(<StudentDetailView {...defaultProps} />);

    // "Aarav Sharma" should generate initials "AS"
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  // 4. Shows course and semester badges
  it('displays course and semester badges in the hero card', () => {
    render(<StudentDetailView {...defaultProps} />);

    // Course appears in hero badge, Academic Info card, and Enrollment Details card
    const courseEls = screen.getAllByText(/Computer Science/);
    expect(courseEls.length).toBeGreaterThanOrEqual(1);
    // Semester appears in hero badge and Academic Info card
    const semEls = screen.getAllByText(/Semester 6/);
    expect(semEls.length).toBeGreaterThanOrEqual(1);
  });

  // 5. Academic standing label is determined by semester
  it('shows correct academic standing based on semester', () => {
    // Semester 6 => "Junior" — appears in hero badge AND Academic Info card
    render(<StudentDetailView {...defaultProps} />);
    const juniorEls = screen.getAllByText('Junior');
    expect(juniorEls.length).toBeGreaterThanOrEqual(1);
  });

  // 6. Freshman standing for semester 1-2
  it('shows Freshman standing for semester 2 student', () => {
    const freshmanStudent = { ...mockStudent, id: 4, semester: 2 };
    render(<StudentDetailView {...defaultProps} student={freshmanStudent} />);
    // "Freshman" appears in both hero badge and Academic Info card
    const els = screen.getAllByText('Freshman');
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  // 7. Senior standing for semester 7-8
  it('shows Senior standing for semester 8 student', () => {
    const seniorStudent = { ...mockStudent, id: 3, semester: 8 };
    render(<StudentDetailView {...defaultProps} student={seniorStudent} />);
    // "Senior" appears in both hero badge and Academic Info card
    const els = screen.getAllByText('Senior');
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  // 8. Sophomore standing for semester 3-4
  it('shows Sophomore standing for semester 4 student', () => {
    const sophomoreStudent = { ...mockStudent, id: 2, semester: 4 };
    render(<StudentDetailView {...defaultProps} student={sophomoreStudent} />);
    // "Sophomore" appears in both hero badge and Academic Info card
    const els = screen.getAllByText('Sophomore');
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  // 9. Progress bar reflects correct percentage
  it('renders progress bar with correct percentage for semester 6 of 8', () => {
    render(<StudentDetailView {...defaultProps} />);

    // 6/8 = 75%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Semester 6 of 8')).toBeInTheDocument();
  });

  // 10. Progress bar shows 100% for semester 8
  it('renders 100% progress bar for final semester student', () => {
    const finalSemStudent = { ...mockStudent, semester: 8 };
    render(<StudentDetailView {...defaultProps} student={finalSemStudent} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  // 11. Semester timeline shows correct completed / current / upcoming dots
  it('renders 8 semester timeline dots with correct states', () => {
    render(<StudentDetailView {...defaultProps} />);

    // Student is in semester 6, so:
    // Sem 1-5: completed, Sem 6: current, Sem 7-8: upcoming
    const dots = screen.getAllByTitle(/Semester \d/);
    expect(dots).toHaveLength(8);

    // Semesters 1-5 should be "Completed"
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTitle(`Semester ${i} — Completed`)).toBeInTheDocument();
    }
    // Semester 6 should be "Current"
    expect(screen.getByTitle('Semester 6 — Current')).toBeInTheDocument();
    // Semesters 7-8 should be "Upcoming"
    expect(screen.getByTitle('Semester 7 — Upcoming')).toBeInTheDocument();
    expect(screen.getByTitle('Semester 8 — Upcoming')).toBeInTheDocument();
  });

  // 12. Personal Information card shows student ID
  it('displays student ID badge in personal information section', () => {
    render(<StudentDetailView {...defaultProps} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  // 13. Registration ID is formatted correctly
  it('displays correctly formatted registration ID (REG-0001)', () => {
    render(<StudentDetailView {...defaultProps} />);

    expect(screen.getByText('REG-0001')).toBeInTheDocument();
  });

  // 14. Active enrollment status is shown
  it('displays active enrollment status', () => {
    render(<StudentDetailView {...defaultProps} />);

    // "● Active" appears in Personal Info and "● Currently Enrolled" in Enrollment Details
    const activeStatuses = screen.getAllByText('● Active');
    expect(activeStatuses.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('● Currently Enrolled')).toBeInTheDocument();
  });

  // 15. Breadcrumb shows student name
  it('renders breadcrumb navigation with student name', () => {
    render(<StudentDetailView {...defaultProps} />);

    // The breadcrumb should have "Back to Directory" link and the student name
    expect(screen.getByLabelText('Go back to student directory')).toBeInTheDocument();
    // Student name appears in breadcrumb (and also in hero, so check at least one)
    const breadcrumbName = screen.getAllByText('Aarav Sharma');
    expect(breadcrumbName.length).toBeGreaterThanOrEqual(2); // breadcrumb + hero
  });

  // 16. Back button calls onBack callback
  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    render(<StudentDetailView {...defaultProps} onBack={onBack} />);

    const backBtn = screen.getByLabelText('Go back to student directory');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // 17. Edit button calls onEdit with the student object
  it('calls onEdit with the student when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<StudentDetailView {...defaultProps} onEdit={onEdit} />);

    const editBtn = screen.getByRole('button', { name: /Edit Aarav Sharma/i });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockStudent);
  });

  // 18. Delete button calls onDelete with the student object
  it('calls onDelete with the student when Delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<StudentDetailView {...defaultProps} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Aarav Sharma/i });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockStudent);
  });

  // 19. All four info cards are rendered
  it('renders all four information cards (Personal, Academic, Progress, Enrollment)', () => {
    render(<StudentDetailView {...defaultProps} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Academic Information')).toBeInTheDocument();
    expect(screen.getByText('Academic Progress')).toBeInTheDocument();
    expect(screen.getByText('Enrollment Details')).toBeInTheDocument();
  });

  // 20. Single-name student initials work correctly
  it('handles single-name student initials gracefully', () => {
    const singleNameStudent = { ...mockStudent, name: 'Aarav' };
    render(<StudentDetailView {...defaultProps} student={singleNameStudent} />);

    // Single name "Aarav" => first 2 chars => "AA"
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  // 21. Motivational message changes based on progress
  it('shows motivational progress message based on semester', () => {
    // Semester 6 => 75% => "Almost there!" message
    render(<StudentDetailView {...defaultProps} />);
    expect(screen.getByText(/Almost there/i)).toBeInTheDocument();
  });

  // 22. Early semester shows "Early stages" motivational message
  it('shows early stages message for semester 2 student', () => {
    const earlyStudent = { ...mockStudent, semester: 2 };
    render(<StudentDetailView {...defaultProps} student={earlyStudent} />);
    expect(screen.getByText(/Early stages/i)).toBeInTheDocument();
  });
});
