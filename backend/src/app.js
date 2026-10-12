const express = require('express');
const cors = require('cors');
const { createStudentRouter } = require('./routes');

/**
 * Creates and configures the Express application.
 * @param {import('node:sqlite').DatabaseSync} db - SQLite database instance
 * @returns {express.Application}
 */
function createApp(db) {
  const app = express();

  // Middleware
  app.disable('x-powered-by'); // Remove Express fingerprint header
  app.use(cors());
  app.use(express.json({ limit: '10kb' })); // Reject oversized payloads

  // Handle invalid JSON body syntax errors gracefully
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        success: false,
        message: 'Malformed JSON payload provided.',
      });
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    try {
      // Verify database is accessible with a lightweight query
      const checkStmt = db.prepare('SELECT 1 AS ok');
      const result = checkStmt.get();

      if (result && result.ok === 1) {
        return res.status(200).json({
          status: 'ok',
          message: 'Backend is running and database is accessible.',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'Database check did not return expected value.',
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection failed.',
      });
    }
  });

  // Student API routes
  app.use('/api/students', createStudentRouter(db));

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
}

module.exports = {
  createApp,
};
