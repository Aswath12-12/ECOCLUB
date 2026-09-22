# 🌱 EcoClub House Management System

A comprehensive, production-ready MERN Stack (MongoDB, Express.js, React, Node.js) web application for managing EcoClub students, the four environmental houses, weekly activities, student marks, live house championships, and password resets.

---

## 🌟 Key Highlights & Business Rules

1. **Four House System:**
   - Supports exactly four houses: **Green House (`GREEN`)**, **Blue House (`BLUE`)**, **Red House (`RED`)**, and **Yellow House (`YELLOW`)**.
   - Admin can rename any house (e.g. *Green House* $\rightarrow$ *Evergreen House*). The changes cascade dynamically across the application because no house names are hard-coded.
   - System prevents deleting houses or creating a fifth house.
2. **Student Accounts & Default Password:**
   - Every student belongs to one of the four houses.
   - Newly created students (and students whose passwords have been reset by an Admin) receive the default hashed password:
     ```
     eocsxcce
     ```
   - All newly created or reset accounts have `mustChangePassword = true`.
   - **First Login Forced Redirect:** Students are blocked from the dashboard and immediately routed to `/student/change-password` with the notification:
     > *"Your account is using the default password. Please create a new password before continuing."*
   - Once a student creates a new password, `mustChangePassword` is set to `false`, granting access to `/student/dashboard`.
3. **Safe Password Reset Request Workflow:**
   - No public unauthenticated password overwrite.
   - Students submit a request with their **Roll Number** (and optional Email) on `/forgot-password`.
   - Admin reviews the request queue at `/admin/password-requests` and clicks **Reset Password** with confirmation.
   - Password reverts to `eocsxcce` with `mustChangePassword = true`.
4. **Weekly Marks & Historical House Integrity:**
   - Marks are awarded to individual students for weekly activities (e.g. Tree Plantation, Plastic Cleanups, Eco Quiz).
   - Duplicate marks for `student + activity + week` are prevented via compound unique database indexes. Submitting marks updates existing records rather than duplicating them.
   - **House History Rule:** When a student changes house, historical marks retain the original house reference under which they were earned, ensuring historical weekly rankings remain 100% accurate.
5. **Dynamic House Championship Ranking Engine:**
   - House scores are calculated dynamically from valid student marks (`$sum`).
   - Dynamic 1st, 2nd, 3rd, and 4th standings with deterministic tie-breaking:
     1. Highest total points
     2. Higher participation percentage (Total points earned / Max possible points)
     3. Active student membership count
     4. Alphabetical house code
6. **Mobile Responsiveness:**
   - Tested and optimized across 320px, 375px, 390px, 414px, 768px, 1024px, and 1366px viewports with zero horizontal scrolling.
   - Desktop data tables transform into touch-friendly cards on mobile viewports.
   - Student dashboard features a mobile bottom navigation bar (`Home`, `Marks`, `House`, `Ranking`, `Profile`).
7. **CSV & Excel Bulk Import:**
   - Supports `.csv` and `.xlsx` spreadsheets.
   - Two-phase import: **Upload & Parse** $\rightarrow$ **Live Validation Preview** (flags invalid houses, duplicate roll numbers in file or DB) $\rightarrow$ **Confirm Import**.
   - Downloadable CSV sample templates.

---

## 🏗️ Architecture & Project Structure

```
ecoclub/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # Mongoose MongoDB connection
│   │   │   └── seed.js                 # Database seed script (4 houses, dev admin, sample students & marks)
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, profile, password change, reset requests
│   │   │   ├── studentController.js    # CRUD, search, filters, house assignment, CSV/Excel import
│   │   │   ├── houseController.js      # House listing, rename, dynamic overall & weekly rankings
│   │   │   ├── activityController.js   # Eco weekly activities CRUD
│   │   │   ├── markController.js       # Grading sheet, marks upsert, student score views
│   │   │   ├── reportController.js     # Analytics, trends, and dashboard stats
│   │   │   └── passwordResetController.js # Admin password reset queue & approval
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT validation & role authorization (ADMIN, STUDENT)
│   │   │   ├── errorMiddleware.js      # Centralized error handler & 404 handler
│   │   │   └── uploadMiddleware.js     # Multer memory storage for CSV and Excel files
│   │   ├── models/
│   │   │   ├── User.js                 # Admin user schema with bcrypt hashing
│   │   │   ├── Student.js              # Student schema (rollNo, houseId, default password, status)
│   │   │   ├── House.js                # 4 Houses schema (GREEN, BLUE, RED, YELLOW)
│   │   │   ├── Activity.js             # Eco activity schema (weekNumber, maxMarks, date)
│   │   │   ├── WeeklyMark.js           # Student mark schema with compound unique index
│   │   │   └── PasswordResetRequest.js # Reset request queue schema (PENDING, COMPLETED, REJECTED)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── houseRoutes.js
│   │   │   ├── activityRoutes.js
│   │   │   ├── markRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── passwordResetRoutes.js
│   │   ├── services/
│   │   │   ├── rankingService.js       # Dynamic ranking aggregation & tie-breaker logic
│   │   │   └── importService.js        # CSV/Excel parsing, validation & batch insert
│   │   ├── utils/
│   │   │   ├── constants.js            # Default passwords, initial houses, roles
│   │   │   ├── jwtHelper.js            # Token generation and verification
│   │   │   └── responseHandler.js      # Standard API JSON responses
│   │   ├── app.js                      # Express configuration (helmet, cors, morgan, routes)
│   │   └── server.js                   # Server bootstrap
│   ├── .env
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx           # House badges, rank badges, status badges
│   │   │   │   ├── Modal.jsx           # Responsive mobile-friendly modal
│   │   │   │   ├── ConfirmationModal.jsx # Destructive action confirmation dialogs
│   │   │   │   ├── Alert.jsx           # Toast / alerts
│   │   │   │   ├── LoadingSpinner.jsx  # Eco themed loading spinner
│   │   │   │   └── EmptyState.jsx      # Empty state with icons and actions
│   │   │   ├── charts/
│   │   │   │   ├── HousePointsBarChart.jsx # Recharts bar chart for house points
│   │   │   │   ├── WeeklyTrendChart.jsx    # Recharts multi-line chart for weekly trends
│   │   │   │   └── ParticipationChart.jsx  # Recharts donut chart for student distribution
│   │   │   └── import/
│   │   │       └── ImportPreviewModal.jsx  # 2-step CSV/Excel preview & import modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # User session, JWT token, role, password state
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx         # Desktop sidebar + Mobile drawer
│   │   │   └── StudentLayout.jsx       # Desktop navbar + Mobile bottom navigation bar
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx       # Unified Admin & Student login with quick dev fills
│   │   │   │   ├── ChangePasswordPage.jsx # Mandatory first-login & voluntary password update
│   │   │   │   └── ForgotPasswordPage.jsx # Student password reset request submission
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx  # Overview metrics, house scores, ranking, quick actions
│   │   │   │   ├── AdminStudents.jsx   # Search, filters, add/edit, bulk house assignment
│   │   │   │   ├── AdminHouses.jsx     # 4 House cards with rename modal
│   │   │   │   ├── AdminActivities.jsx # Weekly activity management
│   │   │   │   ├── AdminWeeklyMarks.jsx# Weekly student marking sheet & batch save
│   │   │   │   ├── AdminRankings.jsx   # Championship leaderboard & weekly rankings
│   │   │   │   ├── AdminReports.jsx    # Recharts visual analytical reports
│   │   │   │   └── AdminPasswordRequests.jsx # Pending reset review & 1-click reset
│   │   │   └── student/
│   │   │       ├── StudentDashboard.jsx# Mobile-first cards, weekly marks, house rank, %
│   │   │       ├── StudentWeeklyMarks.jsx# Activity score breakdown per week
│   │   │       ├── StudentHouse.jsx    # House standing, description, and members
│   │   │       ├── StudentRanking.jsx  # Championship leaderboard with user house highlighted
│   │   │       └── StudentProfile.jsx  # Student details and security status
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client with JWT interceptor & 401 handler
│   │   │   └── services.js             # API service methods
│   │   ├── utils/
│   │   │   ├── constants.js            # House colors, badges, departments, years
│   │   │   └── templateGenerators.js   # Browser CSV template generator
│   │   ├── App.jsx                     # Protected routing & forced password change redirect
│   │   ├── main.jsx                    # Vite React entry point
│   │   └── index.css                   # Tailwind directives & typography
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecoclub
JWT_SECRET=ecoclub_super_secret_jwt_key_2026_change_in_prod
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ALLOW_ADMIN_SETUP=true
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Installation & Seeding

#### Install Backend Dependencies:
```bash
cd server
npm install
```

#### Seed the Database:
Populates the 4 houses, initial development admin, sample activities across weeks 1–3, students across departments, realistic marks, and a sample reset request:
```bash
cd server
npm run seed
```

#### Install Frontend Dependencies:
```bash
cd ../client
npm install
```

---

### 4. Running Locally

#### Start the Backend Server:
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

#### Start the Frontend Vite Dev Server:
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 Development Test Credentials

| Role | Identifier | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecoclub.org` | `Admin@123` | Full admin privileges |
| **New Student** | `23IT001` | `eocsxcce` | `mustChangePassword = true` (tests forced redirect) |
| **Active Student** | `23IT002` | `eocsxcce` | Direct dashboard access (Bala Chandran) |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` - Authenticate admin or student, returns JWT token.
- `GET /api/auth/me` - Get current authenticated user profile.
- `POST /api/auth/change-password` - Update password (clears `mustChangePassword` flag).
- `POST /api/auth/request-password-reset` - Student submits reset request.
- `POST /api/auth/create-admin` - Setup initial admin account.

### Students (Admin Only)
- `GET /api/students` - Paginated students with search (`rollNo`, `name`, `email`) & filters (`department`, `year`, `className`, `houseId`, `isActive`).
- `GET /api/students/:id` - Fetch student by ID.
- `POST /api/students` - Create new student with default password `eocsxcce`.
- `PUT /api/students/:id` - Update student profile.
- `PATCH /api/students/:id/status` - Toggle active / inactive student status.
- `DELETE /api/students/:id` - Permanently delete student and associated marks/requests.
- `POST /api/students/bulk-delete` - Permanently delete selected student IDs.
- `PATCH /api/students/:id/house` - Assign or change student's house.
- `POST /api/students/bulk-assign-house` - Assign house to array of student IDs.
- `GET /api/students/import/template/csv` - Download sample CSV bulk import template (`ecoclub_students_template.csv`).
- `GET /api/students/import/template/excel` - Download sample Excel bulk import template (`ecoclub_students_template.xlsx`).
- `POST /api/students/import/csv` - Upload CSV, returns preview with row-level validation.
- `POST /api/students/import/excel` - Upload Excel (.xlsx), returns preview with validation.
- `POST /api/students/import/confirm` - Commit validated students into database.

### Houses
- `GET /api/houses` - List all 4 houses with student counts and total points.
- `PUT /api/houses/:id` - Rename house, update description or theme color (Admin).
- `GET /api/houses/ranking` - Dynamically calculated overall house rankings (1st, 2nd, 3rd, 4th).
- `GET /api/houses/ranking/weekly/:weekNumber` - Dynamically calculated weekly ranking.

### Activities
- `GET /api/activities` - List activities (filter by `weekNumber`).
- `POST /api/activities` - Create weekly activity (Admin).
- `PUT /api/activities/:id` - Edit activity (Admin).
- `DELETE /api/activities/:id` - Delete activity (Admin).

### Marks
- `GET /api/marks/grading-sheet` - Get student list for week, house, and activity with prefilled marks (Admin).
- `POST /api/marks` - Bulk upsert weekly marks (Admin).
- `GET /api/marks/my-marks` - Student views their own marks and weekly breakdown (Student).
- `GET /api/marks/student/:studentId` - View specific student's marks (Admin or student self).

### Password Reset Queue (Admin Only)
- `GET /api/password-resets` - List pending and historical reset requests.
- `POST /api/password-resets/:requestId/reset` - Reset student password to `eocsxcce` + set `mustChangePassword = true`.
- `POST /api/password-resets/:requestId/reject` - Reject reset request.

### Reports & Analytics (Admin Only)
- `GET /api/reports/dashboard` - Dashboard overview counters, participation rates, and rankings.
- `GET /api/reports/house-performance` - House point comparisons and weekly trends.
- `GET /api/reports/student-performance` - Top individual scorers and department distribution.

---

## 🛠️ Troubleshooting

- **MongoDB connection refused:** Ensure MongoDB is running (`netstat -ano | findstr 27017` or `Get-Service -Name "*mongo*"`).
- **Default student login not reaching dashboard:** This is an intentional security feature. New students with `mustChangePassword = true` are redirected to `/student/change-password` until they create a new password.
- **Port conflicts:** Backend defaults to port 5000 and frontend to 5173. Configure different ports in `server/.env` and `client/vite.config.js` if necessary.
#   E C O C L U B  
 #   E C O C L U B  
 #   E C O C L U B  
 