# Student Management System

[![Student Management System CI](https://github.com/garvshrivastava24/cloud-project/actions/workflows/ci.yml/badge.svg)](https://github.com/garvshrivastava24/cloud-project/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

A full-stack student management application built with **React**, **Vite**, **Node.js**, **Express**, and **SQLite**. The system provides an administrative dashboard with real-time academic metrics, a searchable student directory with multi-criteria filtering, and complete CRUD functionality.

The repository includes automated backend and frontend test suites (28 tests total) and a continuous integration pipeline powered by **GitHub Actions** that verifies test suites and production build integrity on every push and pull request.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites & Local Setup](#prerequisites--local-setup)
- [Application Usage](#application-usage)
- [REST API Documentation](#rest-api-documentation)
- [Automated Testing](#automated-testing)
- [Continuous Integration (CI) Workflow](#continuous-integration-ci-workflow)
- [Limitations & Future Improvements](#limitations--future-improvements)
- [License](#license)

---

## Features

### Administrative Dashboard (`#/`)
- **Real-Time Summary Cards**:
  - **Total Students**: Dynamic count of enrolled students.
  - **Active Courses**: Number of unique academic programs represented.
  - **Active Semesters**: Number of distinct semesters represented (1–8).
  - **Latest Enrolled**: Identifies the most recently registered student with timestamp.
- **Recent Enrollments Overview**: Compact table displaying the 5 most recently enrolled students with quick edit shortcuts and a direct navigation link to the full directory.

### Student Directory & Academic Filtering (`#/students`)
- **Live Search**: Instant, case-insensitive client-side search matching student names and email addresses.
- **Course Dropdown Filter**: Dynamically populated from active courses across all enrolled students.
- **Semester Dropdown Filter**: Narrows records to a specific semester (Semesters 1 through 8).
- **Combined Filtering**: Simultaneously search by keyword while filtering by course and semester.
- **One-Click Clear**: Instant reset button (`Clear Filters`) that restores full record visibility.
- **Dynamic Counter**: Status badge reflecting total records (`Total Students: X`) or active subset (`Showing Y of X students`).
- **Sortable Columns**: Responsive data table with column headers for ID, Name, Email, Course, Semester, and Registration Date.

### Record Management (CRUD)
- **Add Student Modal**: Modal form with client-side and server-side validation (name, RFC-compliant email regex, course, and semester bounds).
- **Edit Student Modal**: In-place editing pre-populated with existing record data.
- **Delete Confirmation Modal**: Two-step deletion dialog preventing accidental removal of student data.
- **User Notifications**: Transient alert banners providing clear confirmation of successful actions and detailed API error messages.

### Reliability & Routing
- **Client-Side Hash Routing**: Lightweight URL routing (`#/` and `#/students`) supporting browser history (`Back` / `Forward`) and persistent view selection on reload without requiring server URL rewrites.
- **Data Persistence**: Local SQLite database with Write-Ahead Logging (WAL) and foreign keys enabled.
- **SQL Injection Protection**: All backend database queries utilize parameterized prepared statements.

---

## Screenshots

> *Placeholder: Interface walkthrough captures.*

| View | Description | Preview |
|---|---|---|
| **Dashboard** (`#/`) | Key metric cards & recent enrollments widget | *Add screenshot of dashboard overview* |
| **Student Directory** (`#/students`) | Search toolbar, course/semester filters & records table | *Add screenshot of directory with active filters* |
| **Add / Edit Modal** | Form dialog with validation feedback | *Add screenshot of student form modal* |

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18.3 | UI component tree, state management, and hooks |
| | Vite 6.0 | Development server, local proxy, and production bundler |
| | Custom CSS3 | Responsive grid layout, dark administrative sidebar, accessible contrast |
| | Vitest 2.1 | Modern test runner executing frontend unit tests |
| | React Testing Library | DOM integration testing and user interaction assertions |
| | jsdom 25.0 | Headless DOM implementation for Vitest |
| **Backend** | Node.js 22 (LTS) | JavaScript runtime environment |
| | Express 4.21 | REST API routing, middleware, and request validation |
| | `node:sqlite` (`DatabaseSync`) | Embedded high-performance SQL engine requiring no external native C++ rebuilds |
| | Supertest 7.0 | HTTP endpoint integration testing assertions |
| | Node Test Runner (`node:test`) | Native assertion runner for backend API test suites |
| **DevOps & CI** | GitHub Actions | Automated CI pipeline executing tests and builds on Ubuntu runners |
| | Git | Source control |
| | Concurrently 9.1 | Orchestrates concurrent frontend and backend processes in development |

---

## Architecture

The application implements a decoupled two-tier client-server architecture:

```
+-----------------------------------------------------------------+
|                       React Frontend (SPA)                      |
|  - Client-side Hash Router: #/ (Dashboard) | #/students         |
|  - Components: Sidebar, Header, SummaryCards, FilterToolbar,    |
|               StudentTable, Modals (Create/Edit/Delete)         |
|  - Development Port: http://localhost:5173                      |
+--------------------------------+--------------------------------+
                                 |
                                 | Vite Proxy: /api/* -> localhost:5000/api/*
                                 v
+-----------------------------------------------------------------+
|                      Express REST API Backend                   |
|  - App Factory (app.js) & Server Entry (server.js)              |
|  - Routes & Validation Layer (routes.js)                        |
|  - Port: http://localhost:5000                                  |
+--------------------------------+--------------------------------+
                                 |
                                 | Parameterized Prepared Statements
                                 v
+-----------------------------------------------------------------+
|                      Local SQLite Database                      |
|  - Storage: backend/data/students.sqlite                        |
|  - Schema: students (id, name, email, course, semester, date)   |
|  - Configuration: WAL journal mode, Foreign Keys ON             |
+-----------------------------------------------------------------+
```

### Request Flow

```mermaid
flowchart TD
    Browser([Browser Client]) -->|User Action: Search / Filter / CRUD| ReactApp[React App: port 5173]
    ReactApp -->|HTTP /api/students Request| ViteProxy[Vite Proxy]
    ViteProxy -->|Forward to localhost:5000| ExpressAPI[Express API: port 5000]
    ExpressAPI -->|Validate Schema & Inputs| Validation{Valid?}
    Validation -- No -->|400 Bad Request / 409 Conflict| ReactApp
    Validation -- Yes --> SQLite[(SQLite Database)]
    SQLite -->|Result Rows / Changes| ExpressAPI
    ExpressAPI -->|200 OK / 201 Created JSON| ReactApp
    ReactApp -->|Update UI & Display Banner| Browser
```

---

## Project Structure

```
cloud-project/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow definition
├── .gitignore                   # Excludes dependencies, SQLite files, build output
├── package.json                 # Monorepo root scripts (dev, test, build, seed)
├── package-lock.json            # Monorepo lockfile
├── README.md                    # Project documentation
│
├── backend/
│   ├── data/
│   │   └── .gitkeep             # SQLite storage directory placeholder
│   ├── scripts/
│   │   └── seed.js              # Idempotent database seed script
│   ├── src/
│   │   ├── app.js               # Express application factory & middleware
│   │   ├── db.js                # SQLite schema initialization & connection
│   │   ├── routes.js            # REST endpoints & input validation handlers
│   │   └── server.js            # Server entry point listening on port 5000
│   ├── tests/
│   │   └── students.test.js     # 12 automated API tests using node:test & supertest
│   ├── package.json             # Backend dependencies & test scripts
│   └── package-lock.json        # Backend dependency lockfile
│
└── frontend/
    ├── public/                  # Static assets
    ├── src/
    │   ├── components/
    │   │   ├── DeleteConfirmModal.jsx      # Confirmation dialog for record removal
    │   │   ├── FilterToolbar.jsx           # Search input and course/semester dropdowns
    │   │   ├── Header.jsx                  # Top navigation header & dynamic page badge
    │   │   ├── Notification.jsx            # Action notification alert banner
    │   │   ├── RecentEnrollmentsTable.jsx  # Compact recent students table for Dashboard
    │   │   ├── Sidebar.jsx                 # Dark sidebar with Dashboard & Students nav
    │   │   ├── StudentFormModal.jsx        # Add / Edit student form modal
    │   │   ├── StudentTable.jsx            # Student records table with action triggers
    │   │   └── SummaryCards.jsx            # 4 metric summary cards
    │   ├── api.js               # Centralized REST API client
    │   ├── App.jsx              # Main dashboard container & client hash router
    │   ├── App.test.jsx         # 16 frontend unit & integration tests
    │   ├── index.css            # Responsive styles and design tokens
    │   ├── main.jsx             # React DOM mounting entry point
    │   └── setupTests.js        # Vitest jest-dom setup
    ├── index.html               # Single-page application HTML entry
    ├── vite.config.js           # Vite dev server, proxy, and Vitest configuration
    ├── package.json             # Frontend dependencies & scripts
    └── package-lock.json        # Frontend dependency lockfile
```

---

## Prerequisites & Local Setup

### 1. Prerequisites
- **Node.js**: `v22.0.0` or higher (Node 22 LTS recommended for built-in `node:sqlite`).
  ```bash
  node -v
  ```
- **npm**: `v10.0.0` or higher.
  ```bash
  npm -v
  ```
- **Git**: Installed and available in your shell.
  ```bash
  git --version
  ```

### 2. Clone the Repository
```bash
git clone https://github.com/garvshrivastava24/cloud-project.git
cd cloud-project
```

### 3. Install Dependencies
Dependencies can be installed across all packages with a single root command:
```bash
npm run install:all
```

Alternatively, install each package individually:
```bash
# Root monorepo dependencies
npm install

# Backend dependencies
npm --prefix backend install

# Frontend dependencies
npm --prefix frontend install
```

### 4. Database Setup & Optional Seeding
The backend automatically initializes the SQLite schema (`backend/data/students.sqlite`) on first launch.

To populate optional sample records for testing:
```bash
npm run seed
```
> **Note**: The seed script is idempotent. It checks for existing email addresses before inserting and will safely skip duplicate records without modifying existing data.

To reset the local database:
```powershell
# PowerShell (Windows)
Remove-Item backend\data\students.sqlite* -Force
```
```bash
# Bash (Linux / macOS)
rm -f backend/data/students.sqlite*
```

### 5. Start the Application
Start both the Express backend and the Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API Base**: [`http://localhost:5000/api`](http://localhost:5000/api)
- **Backend Health Check**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## Application Usage

1. **Dashboard Overview (`#/`)**:
   - Displays real-time summary cards: Total Students, Active Courses, Active Semesters, and Latest Enrolled.
   - Shows the 5 most recent registrations in the Recent Enrollments widget.
   - Click `+ Add Student` to open the creation modal, or `Browse Directory →` to navigate directly to all student records.

2. **Student Directory (`#/students`)**:
   - Access via the sidebar navigation item **Students**.
   - **Search**: Type in the search box to filter records by student name or email in real time.
   - **Filter by Course**: Select any academic program from the dropdown.
   - **Filter by Semester**: Select any semester (1–8) from the dropdown.
   - **Clear Filters**: Click `Clear Filters` to reset all search inputs and show all registered students.

3. **Managing Records**:
   - **Add**: Click `+ Add Student`, complete the form (Name, Email, Course, Semester), and submit.
   - **Edit**: Click `Edit` on any student row to update their name, email, course, or semester.
   - **Delete**: Click `Delete` on any row and confirm in the modal dialog to permanently remove the record.

---

## REST API Documentation

**Base URL**: `http://localhost:5000/api`

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Health check & SQLite database connectivity test | `200 OK` |
| `GET` | `/api/students` | Retrieve all student records (sorted by ID descending) | `200 OK` |
| `GET` | `/api/students/:id` | Retrieve a single student by numeric ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/students` | Register a new student record | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `PUT` | `/api/students/:id` | Update an existing student record | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/api/students/:id` | Delete an existing student record | `200 OK`, `404 Not Found` |

### Validation Rules
- `name`: String, minimum 2 characters (trimmed).
- `email`: Valid email syntax matching `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Must be unique.
- `course`: Non-empty string (trimmed).
- `semester`: Integer between `1` and `8` inclusive.

### Sample Payloads

#### `POST /api/students` — Request
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.edu",
  "course": "Computer Science & Engineering",
  "semester": 6
}
```

#### `POST /api/students` — Response (`201 Created`)
```json
{
  "success": true,
  "message": "Student created successfully.",
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.edu",
    "course": "Computer Science & Engineering",
    "semester": 6,
    "created_at": "2026-10-11 12:00:00"
  }
}
```

#### Duplicate Email Error (`409 Conflict`)
```json
{
  "success": false,
  "message": "A student with this email address already exists."
}
```

---

## Automated Testing

The project includes **28 automated tests** covering backend API routes and frontend React components.

### Run All Tests
Execute both backend and frontend test suites from the root directory:
```bash
npm test
```

### Backend Tests Only
Backend tests use Node.js's native test runner (`node:test`) and Supertest. Each test initializes a clean, isolated in-memory SQLite database (`:memory:`) ensuring zero interaction with or alteration of local data.
```bash
npm run test:backend
```
*Coverage (12 tests)*:
- Health endpoint response and database accessibility.
- Empty and populated student list retrieval.
- Student creation with valid attributes.
- Validation: empty / whitespace-only name rejection.
- Validation: invalid email address rejection.
- Validation: semester out-of-range (< 1 or > 8) rejection.
- Duplicate email conflict rejection (`409 Conflict`).
- Single student retrieval and `404` handling for invalid IDs.
- In-place student update and `404` handling for missing records.
- Student deletion and `404` handling for missing records.

### Frontend Tests Only
Frontend tests execute using Vitest and React Testing Library within a `jsdom` virtual environment. API requests are mocked to ensure fast, deterministic tests.
```bash
npm run test:frontend
```
*Coverage (16 tests)*:
- Dashboard layout, navigation sidebar, topbar header, and 4 summary cards.
- Sidebar view switching between Dashboard and Students pages.
- Client-side hash routing (`#/` and `#/students`) and refresh state persistence.
- Directory table rendering and dynamic student counter accuracy.
- Real-time case-insensitive search by student name and email.
- Course dropdown filtering.
- Semester dropdown filtering.
- Combined multi-criteria search, course, and semester filtering.
- Filter reset button (`Clear Filters`) functionality.
- Empty states for zero records and no-search-results conditions.
- Add student modal submission and state synchronization.
- Edit student modal submission and in-place table update.
- Delete confirmation modal and record removal.
- Client-side form input validation.
- API network error banner handling.
- Keyboard accessibility: modal dialog dismissal via Escape key.

---

## Continuous Integration (CI) Workflow

Continuous Integration is automated using **GitHub Actions**. The pipeline definition is located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Workflow Details

- **Triggers**:
  - Push to `main` branch.
  - Pull Request targeting `main` branch.
  - Manual trigger via `workflow_dispatch`.
- **Runner Environment**: `ubuntu-latest`.
- **Node.js Runtime**: `22` (LTS) explicitly pinned via `actions/setup-node@v4`.
- **Dependency Caching**: Enabled for npm packages matching `backend/package-lock.json` and `frontend/package-lock.json`.
- **Pipeline Execution Steps**:
  1. **Checkout**: Clones the repository using `actions/checkout@v4`.
  2. **Node.js Setup**: Installs Node 22 with npm cache enabled.
  3. **Backend Install**: Executes `npm ci` in `backend`.
  4. **Frontend Install**: Executes `npm ci` in `frontend`.
  5. **Backend Tests**: Executes `npm test` in `backend` (12 automated tests).
  6. **Frontend Tests**: Executes `npm test` in `frontend` (16 automated tests).
  7. **Production Build**: Executes `npm run build` in `frontend` (`vite build`).

The CI workflow fails with a non-zero exit code if any test or production build step encounters an error, preventing regressions from merging into the `main` branch.

---

## Limitations & Future Improvements

### Current Limitations
- **Single-Tenant Admin**: Designed as a single-administrator tool; does not include user authentication or role-based access control (RBAC).
- **Embedded Persistence**: Uses local SQLite storage, suitable for single-instance hosting rather than multi-server distributed deployments.
- **Client-Side Pagination**: Record filtering and sorting occur on the client, suitable for up to several thousand student records.

### Planned Improvements
- [ ] User authentication with JWT and role-based permissions (Admin, Faculty, Student).
- [ ] Server-side pagination and sorting for scaling to tens of thousands of records.
- [ ] CSV and PDF student record export options.
- [ ] Docker and Docker Compose configuration for containerized deployment.

---

## License

This repository does not currently declare a root open-source license. Individual package manifests include standard development defaults (e.g. ISC for backend modules), but overarching licensing is unspecified. For permissions or questions, please contact the repository owner.
