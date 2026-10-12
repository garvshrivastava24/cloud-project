import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from './Pagination';
import StudentTable from './StudentTable';

describe('Pagination Component & StudentTable Integration', () => {
  // Generate 25 students to test 10 items/page pagination (3 pages)
  const generateMockStudents = (count) =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Student ${String(i + 1).padStart(2, '0')}`,
      email: `student${i + 1}@example.com`,
      course: 'Computer Science',
      semester: (i % 8) + 1,
      created_at: '2026-10-10 10:00:00',
    }));

  it('renders Pagination bar with correct page indicator and dispatches page changes', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
        totalItems={25}
        pageSize={10}
      />
    );

    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    const nextBtn = screen.getByRole('button', { name: /next page/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('hides Pagination bar when totalPages <= 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
        totalItems={5}
        pageSize={10}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays 10 rows on page 1 and navigates to page 2 and page 3 in StudentTable', () => {
    const students25 = generateMockStudents(25);
    render(
      <StudentTable
        students={students25}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        pageSize={10}
      />
    );

    // Initial state: default sorting is id 'desc', so Page 1 has Student 25 down to Student 16
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('Student 25')).toBeInTheDocument();
    expect(screen.getByText('Student 16')).toBeInTheDocument();
    expect(screen.queryByText('Student 15')).not.toBeInTheDocument();

    // Click Next -> Page 2 (Student 15 down to Student 06)
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('Student 15')).toBeInTheDocument();
    expect(screen.getByText('Student 06')).toBeInTheDocument();
    expect(screen.queryByText('Student 25')).not.toBeInTheDocument();

    // Click Next -> Page 3 (Student 05 down to Student 01)
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Page 3 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('Student 05')).toBeInTheDocument();
    expect(screen.getByText('Student 01')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });

  it('resets to page 1 whenever students list prop changes', () => {
    const students25 = generateMockStudents(25);
    const { rerender } = render(
      <StudentTable
        students={students25}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        pageSize={10}
      />
    );

    // Navigate to page 2
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();

    // Simulate filter change (e.g. filtered to 15 students)
    const filteredStudents = students25.slice(0, 15);
    rerender(
      <StudentTable
        students={filteredStudents}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        pageSize={10}
      />
    );

    // Should be automatically reset to Page 1 of 2
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
  });
});
