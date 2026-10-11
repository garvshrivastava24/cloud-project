import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import FilterToolbar from './components/FilterToolbar';
import Notification from './components/Notification';
import StudentTable from './components/StudentTable';
import RecentEnrollmentsTable from './components/RecentEnrollmentsTable';
import StudentFormModal from './components/StudentFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { api } from './api';

// Helper to get normalized view from URL hash
function getViewFromHash() {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#/students' || hash === '#students') {
    return 'students';
  }
  return 'dashboard';
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [notification, setNotification] = useState(null);

  // Filters State for Student Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Listen to browser hash changes (Back, Forward, initial refresh)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when view changes via UI button
  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
    const targetHash = view === 'students' ? '#/students' : '#/';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, []);

  // Fetch all students on mount
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      setStudents(res.data || []);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr && curr.message === message ? null : curr));
    }, 5000);
  };

  // Distinct courses derived dynamically from active data
  const availableCourses = useMemo(() => {
    const set = new Set(
      students.map((s) => (s.course || '').trim()).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [students]);

  // Combined Filtering: Search AND Course AND Semester
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return students.filter((s) => {
      // 1. Search filter (Name or Email)
      const matchesSearch =
        !query ||
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query));

      // 2. Course filter
      const matchesCourse =
        !selectedCourse ||
        (s.course && s.course.trim().toLowerCase() === selectedCourse.trim().toLowerCase());

      // 3. Semester filter
      const matchesSemester =
        !selectedSemester || String(s.semester) === String(selectedSemester);

      return matchesSearch && matchesCourse && matchesSemester;
    });
  }, [students, searchQuery, selectedCourse, selectedSemester]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCourse || selectedSemester
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedSemester('');
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        // Edit existing student
        await api.updateStudent(selectedStudent.id, formData);
        showNotification('success', `Student "${formData.name}" updated successfully.`);
      } else {
        // Create new student
        await api.createStudent(formData);
        showNotification('success', `Student "${formData.name}" added successfully.`);
      }
      setIsFormOpen(false);
      await loadStudents();
    } catch (err) {
      showNotification('error', err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (student) => {
    setStudentToDelete(student);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await api.deleteStudent(id);
      showNotification('success', 'Student record deleted successfully.');
      setIsDeleteOpen(false);
      setStudentToDelete(null);
      await loadStudents();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Compact Left Sidebar */}
      <Sidebar currentView={currentView} onViewChange={handleNavigate} />

      {/* Main Content Pane */}
      <div className="dashboard-main">
        {/* Compact Top Header */}
        <Header currentView={currentView} />

        <main className="dashboard-body">
          {/* Notifications Banner */}
          <Notification
            notification={notification}
            onDismiss={() => setNotification(null)}
          />

          {/* PAGE 1: DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="page-dashboard">
              <div className="dashboard-hero">
                <div className="hero-text-row">
                  <div>
                    <h2 className="hero-title">Student Overview</h2>
                    <p className="hero-subtitle">
                      System statistics, academic standing distribution, and latest student registrations.
                    </p>
                  </div>
                  <div className="hero-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleOpenAddModal}
                      aria-label="Add new student"
                    >
                      <span aria-hidden="true">＋</span> Add Student
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleNavigate('students')}
                      aria-label="Go to student directory"
                    >
                      Browse Directory →
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Responsive Summary Metric Cards */}
              <SummaryCards students={students} />

              {/* Recent Enrollments Overview */}
              <section className="management-section" aria-label="Recent Enrollments Overview">
                {loading ? (
                  <div className="table-card">
                    <div className="state-container">
                      <div className="spinner" aria-hidden="true"></div>
                      <p>Loading overview metrics from SQLite database...</p>
                    </div>
                  </div>
                ) : (
                  <RecentEnrollmentsTable
                    students={students}
                    onViewAllStudents={() => handleNavigate('students')}
                    onEdit={handleOpenEditModal}
                  />
                )}
              </section>
            </div>
          )}

          {/* PAGE 2: STUDENTS DIRECTORY VIEW */}
          {currentView === 'students' && (
            <div className="page-students">
              <div className="dashboard-hero">
                <div className="hero-text-row">
                  <div>
                    <h2 className="hero-title">Student Directory</h2>
                    <p className="hero-subtitle">
                      Complete directory of registered students with search, academic filters, and record management.
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Management Section with Combined Search & Filters */}
              <section className="management-section" aria-label="Student Directory Management">
                <div className="management-header">
                  <div className="management-title-group">
                    <h2>All Students</h2>
                    <p>Filter by course and semester, search by name or email, and sort columns.</p>
                  </div>
                </div>

                {/* Combined Search & Filter Toolbar */}
                <FilterToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCourse={selectedCourse}
                  onCourseChange={setSelectedCourse}
                  selectedSemester={selectedSemester}
                  onSemesterChange={setSelectedSemester}
                  availableCourses={availableCourses}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                  totalCount={students.length}
                  filteredCount={filteredStudents.length}
                  onOpenAddModal={handleOpenAddModal}
                />

                {/* Loading or Full Student Table */}
                {loading ? (
                  <div className="table-card">
                    <div className="state-container">
                      <div className="spinner" aria-hidden="true"></div>
                      <p>Loading student records from SQLite database...</p>
                    </div>
                  </div>
                ) : (
                  <StudentTable
                    students={filteredStudents}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                  />
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        student={selectedStudent}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        student={studentToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
