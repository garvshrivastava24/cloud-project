const express = require('express');

/**
 * Creates student router with injected database dependency
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {express.Router}
 */
function createStudentRouter(db) {
  const router = express.Router();

  // Email validation regex (standard basic RFC-compliant check)
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Helper to validate student input fields
   */
  function validateStudentInput(body, isUpdate = false) {
    const { name, email, course, semester } = body;
    const errors = [];

    // Name validation
    if (!isUpdate || name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and cannot be empty.');
      }
    }

    // Email validation
    if (!isUpdate || email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        errors.push('A valid email address is required.');
      }
    }

    // Course validation
    if (!isUpdate || course !== undefined) {
      if (typeof course !== 'string' || course.trim().length === 0) {
        errors.push('Course is required and cannot be empty.');
      }
    }

    // Semester validation
    if (!isUpdate || semester !== undefined) {
      const parsedSemester = Number(semester);
      if (
        !Number.isInteger(parsedSemester) ||
        parsedSemester < 1 ||
        parsedSemester > 8
      ) {
        errors.push('Semester must be an integer between 1 and 8.');
      }
    }

    return errors;
  }

  // GET /api/students - List all students
  router.get('/', (req, res) => {
    try {
      const statement = db.prepare('SELECT id, name, email, course, semester, created_at FROM students ORDER BY id DESC');
      const students = statement.all();
      return res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve students.',
      });
    }
  });

  // GET /api/students/:id - Get student by ID
  router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID. ID must be a positive integer.',
      });
    }

    try {
      const statement = db.prepare('SELECT id, name, email, course, semester, created_at FROM students WHERE id = ?');
      const student = statement.get(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: student,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student.',
      });
    }
  });

  // POST /api/students - Create a new student
  router.post('/', (req, res) => {
    const errors = validateStudentInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const course = req.body.course.trim();
    const semester = Number(req.body.semester);

    try {
      // Check if email already exists
      const checkStmt = db.prepare('SELECT id FROM students WHERE email = ?');
      const existing = checkStmt.get(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }

      const insertStmt = db.prepare(
        'INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)'
      );
      const result = insertStmt.run(name, email, course, semester);

      // Fetch the newly created record
      const fetchStmt = db.prepare('SELECT id, name, email, course, semester, created_at FROM students WHERE id = ?');
      const createdStudent = fetchStmt.get(Number(result.lastInsertRowid));

      return res.status(201).json({
        success: true,
        message: 'Student created successfully.',
        data: createdStudent,
      });
    } catch (err) {
      // Handle SQLite unique constraint error if it raced
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to create student.',
      });
    }
  });

  // PUT /api/students/:id - Update an existing student
  router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID. ID must be a positive integer.',
      });
    }

    const errors = validateStudentInput(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const course = req.body.course.trim();
    const semester = Number(req.body.semester);

    try {
      // Check if student exists
      const checkIdStmt = db.prepare('SELECT id FROM students WHERE id = ?');
      const student = checkIdStmt.get(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      // Check if email is already taken by another student
      const checkEmailStmt = db.prepare('SELECT id FROM students WHERE email = ? AND id != ?');
      const existingEmail = checkEmailStmt.get(email, id);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }

      const updateStmt = db.prepare(
        'UPDATE students SET name = ?, email = ?, course = ?, semester = ? WHERE id = ?'
      );
      updateStmt.run(name, email, course, semester, id);

      const fetchStmt = db.prepare('SELECT id, name, email, course, semester, created_at FROM students WHERE id = ?');
      const updatedStudent = fetchStmt.get(id);

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully.',
        data: updatedStudent,
      });
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to update student.',
      });
    }
  });

  // DELETE /api/students/:id - Delete a student
  router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID. ID must be a positive integer.',
      });
    }

    try {
      const checkStmt = db.prepare('SELECT id, name FROM students WHERE id = ?');
      const existing = checkStmt.get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      const deleteStmt = db.prepare('DELETE FROM students WHERE id = ?');
      deleteStmt.run(id);

      return res.status(200).json({
        success: true,
        message: `Student ${existing.name} (ID: ${id}) deleted successfully.`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete student.',
      });
    }
  });

  return router;
}

module.exports = {
  createStudentRouter,
};
