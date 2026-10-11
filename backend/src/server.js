const { initDatabase } = require('./db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

try {
  const db = initDatabase();
  const app = createApp(db);

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Students API: http://localhost:${PORT}/api/students`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
