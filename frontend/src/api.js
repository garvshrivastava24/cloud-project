/**
 * API service utility for Student Management System
 * Uses relative paths so Vite proxies /api to the Express backend in development,
 * and any reverse proxy handles it in production.
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || (data.errors ? data.errors.join(', ') : 'Request failed');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }
  return data;
}

export const api = {
  // Check backend health
  async checkHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Get all students
  async getStudents() {
    const res = await fetch(`${BASE_URL}/students`);
    return handleResponse(res);
  },

  // Get student by ID
  async getStudentById(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    return handleResponse(res);
  },

  // Create new student
  async createStudent(student) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    return handleResponse(res);
  },

  // Update existing student
  async updateStudent(id, student) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    return handleResponse(res);
  },

  // Delete student
  async deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
