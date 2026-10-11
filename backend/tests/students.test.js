const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { initDatabase } = require('../src/db');
const { createApp } = require('../src/app');

describe('Student Management System - Backend API Tests', () => {
  let db;
  let app;

  // Use a fresh in-memory SQLite database before each test run for complete isolation
  beforeEach(() => {
    db = initDatabase(':memory:');
    app = createApp(db);
  });

  // 1. Health endpoint test
  it('GET /api/health - returns 200 and confirms database accessibility', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.message, 'Backend is running and database is accessible.');
    assert.ok(res.body.timestamp);
  });

  // 2. Retrieving the student list
  it('GET /api/students - retrieves all students in the database', async () => {
    // Initially empty
    const initialRes = await request(app).get('/api/students');
    assert.equal(initialRes.status, 200);
    assert.equal(initialRes.body.success, true);
    assert.equal(initialRes.body.count, 0);
    assert.deepEqual(initialRes.body.data, []);

    // Insert two records
    db.prepare('INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)').run(
      'Test User 1',
      'test1@college.edu',
      'Computer Science',
      3
    );
    db.prepare('INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)').run(
      'Test User 2',
      'test2@college.edu',
      'Mechanical',
      5
    );

    const res = await request(app).get('/api/students');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.data[0].name, 'Test User 2'); // ORDER BY id DESC
    assert.equal(res.body.data[1].name, 'Test User 1');
  });

  // 3. Creating a valid student
  it('POST /api/students - successfully creates a valid student and returns 201', async () => {
    const newStudent = {
      name: 'Ananya Sharma',
      email: 'ananya@college.edu',
      course: 'Information Technology',
      semester: 4,
    };

    const res = await request(app).post('/api/students').send(newStudent);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Student created successfully.');
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.name, 'Ananya Sharma');
    assert.equal(res.body.data.email, 'ananya@college.edu');
    assert.equal(res.body.data.course, 'Information Technology');
    assert.equal(res.body.data.semester, 4);
    assert.ok(res.body.data.created_at);

    // Verify persisted in DB
    const persisted = db.prepare('SELECT * FROM students WHERE id = ?').get(res.body.data.id);
    assert.ok(persisted);
    assert.equal(persisted.email, 'ananya@college.edu');
  });

  // 4. Rejecting an empty name
  it('POST /api/students - returns 400 when name is empty or only whitespace', async () => {
    const invalidStudent = {
      name: '   ',
      email: 'valid@college.edu',
      course: 'Civil Engineering',
      semester: 2,
    };

    const res = await request(app).post('/api/students').send(invalidStudent);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((err) => err.includes('Name is required')));
  });

  // 5. Rejecting an invalid email
  it('POST /api/students - returns 400 when email format is invalid', async () => {
    const invalidStudent = {
      name: 'Rahul Roy',
      email: 'not-an-email',
      course: 'Electrical Engineering',
      semester: 2,
    };

    const res = await request(app).post('/api/students').send(invalidStudent);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((err) => err.includes('valid email')));
  });

  // 6. Rejecting an invalid semester
  it('POST /api/students - returns 400 when semester is outside 1-8 or not an integer', async () => {
    const invalidStudent1 = {
      name: 'Vikram Singh',
      email: 'vikram@college.edu',
      course: 'Computer Science',
      semester: 9, // Outside 1-8
    };

    const res1 = await request(app).post('/api/students').send(invalidStudent1);
    assert.equal(res1.status, 400);
    assert.equal(res1.body.success, false);
    assert.ok(res1.body.errors.some((err) => err.includes('Semester must be an integer between 1 and 8')));

    const invalidStudent2 = {
      name: 'Vikram Singh',
      email: 'vikram2@college.edu',
      course: 'Computer Science',
      semester: 0, // Outside 1-8
    };

    const res2 = await request(app).post('/api/students').send(invalidStudent2);
    assert.equal(res2.status, 400);
    assert.equal(res2.body.success, false);
  });

  // 7. Rejecting a duplicate email
  it('POST /api/students - returns 409 conflict when email already exists', async () => {
    const student1 = {
      name: 'First Student',
      email: 'duplicate@college.edu',
      course: 'Data Science',
      semester: 1,
    };

    const res1 = await request(app).post('/api/students').send(student1);
    assert.equal(res1.status, 201);

    const student2 = {
      name: 'Second Student',
      email: 'duplicate@college.edu', // Duplicate
      course: 'AI & Robotics',
      semester: 3,
    };

    const res2 = await request(app).post('/api/students').send(student2);
    assert.equal(res2.status, 409);
    assert.equal(res2.body.success, false);
    assert.ok(res2.body.message.includes('already exists'));
  });

  // 8. Retrieving a student by ID
  it('GET /api/students/:id - retrieves a single student by ID, or 404 if nonexistent', async () => {
    const insertStmt = db.prepare('INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)');
    const result = insertStmt.run('Geeta Devi', 'geeta@college.edu', 'Biotechnology', 5);
    const studentId = Number(result.lastInsertRowid);

    // Retrieve existing student
    const resFound = await request(app).get(`/api/students/${studentId}`);
    assert.equal(resFound.status, 200);
    assert.equal(resFound.body.success, true);
    assert.equal(resFound.body.data.id, studentId);
    assert.equal(resFound.body.data.name, 'Geeta Devi');

    // Retrieve non-existent student
    const resNotFound = await request(app).get('/api/students/99999');
    assert.equal(resNotFound.status, 404);
    assert.equal(resNotFound.body.success, false);
    assert.ok(resNotFound.body.message.includes('not found'));
  });

  // 9. Updating a student
  it('PUT /api/students/:id - updates an existing student successfully', async () => {
    const insertStmt = db.prepare('INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)');
    const result = insertStmt.run('Initial Name', 'initial@college.edu', 'Physics', 2);
    const studentId = Number(result.lastInsertRowid);

    const updatedData = {
      name: 'Updated Name',
      email: 'updated@college.edu',
      course: 'Applied Physics',
      semester: 3,
    };

    const res = await request(app).put(`/api/students/${studentId}`).send(updatedData);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Updated Name');
    assert.equal(res.body.data.email, 'updated@college.edu');
    assert.equal(res.body.data.course, 'Applied Physics');
    assert.equal(res.body.data.semester, 3);

    // Verify DB reflection
    const dbRecord = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    assert.equal(dbRecord.name, 'Updated Name');
  });

  // 10. Rejecting updates for nonexistent students
  it('PUT /api/students/:id - returns 404 when updating a nonexistent student', async () => {
    const updateData = {
      name: 'Ghost Student',
      email: 'ghost@college.edu',
      course: 'Mathematics',
      semester: 1,
    };

    const res = await request(app).put('/api/students/99999').send(updateData);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('not found'));
  });

  // 11. Deleting a student
  it('DELETE /api/students/:id - successfully deletes an existing student', async () => {
    const insertStmt = db.prepare('INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)');
    const result = insertStmt.run('To Delete', 'todelete@college.edu', 'Chemistry', 1);
    const studentId = Number(result.lastInsertRowid);

    const res = await request(app).delete(`/api/students/${studentId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.message.includes('deleted successfully'));

    // Verify record no longer exists in DB
    const dbRecord = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    assert.equal(dbRecord, undefined);
  });

  // 12. Rejecting deletion for nonexistent students
  it('DELETE /api/students/:id - returns 404 when deleting a nonexistent student', async () => {
    const res = await request(app).delete('/api/students/99999');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('not found'));
  });
});
