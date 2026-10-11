const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

/**
 * Initializes and returns an SQLite database connection.
 * @param {string} [customDbPath] - Optional custom path for the database file or ':memory:'
 * @returns {DatabaseSync}
 */
function initDatabase(customDbPath) {
  let dbPath = customDbPath || process.env.DB_PATH;

  if (!dbPath) {
    const dataDir = path.resolve(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'students.sqlite');
  } else if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enable foreign keys and WAL mode for better concurrency when not in-memory
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // Create the students table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      course TEXT NOT NULL,
      semester INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  return db;
}

module.exports = {
  initDatabase,
};
