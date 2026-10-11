const { initDatabase } = require('../src/db');

const seedStudents = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.edu',
    course: 'Computer Science & Engineering',
    semester: 6,
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.edu',
    course: 'Information Technology',
    semester: 4,
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@example.edu',
    course: 'Electronics & Communication',
    semester: 8,
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.edu',
    course: 'Data Science',
    semester: 2,
  },
];

function seed() {
  console.log('Starting database seeding...');
  const db = initDatabase();

  const checkStmt = db.prepare('SELECT id FROM students WHERE email = ?');
  const insertStmt = db.prepare(
    'INSERT INTO students (name, email, course, semester) VALUES (?, ?, ?, ?)'
  );

  let insertedCount = 0;
  let skippedCount = 0;

  for (const student of seedStudents) {
    const existing = checkStmt.get(student.email);
    if (existing) {
      console.log(`- Skipped: ${student.name} (${student.email}) already exists.`);
      skippedCount++;
    } else {
      insertStmt.run(student.name, student.email, student.course, student.semester);
      console.log(`+ Inserted: ${student.name} (${student.email})`);
      insertedCount++;
    }
  }

  console.log(`Seeding complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}.`);
}

seed();
