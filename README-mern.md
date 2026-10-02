# Future IT College — MERN Stack Application

Full-stack website + Student Portal + Online Examination System + Admin
Panel with Question Bank Management. Same original UI/UX, colors,
typography and animations throughout.

## Structure

```
future-it-college/
  client/   React 19 + Vite + TypeScript + Tailwind CSS
  server/   Node.js + Express + MongoDB + JWT
```

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env          # edit MONGODB_URI etc. if needed
npm run seed                   # website content: Courses, Faculty, Gallery
npm run seed:exam               # exam module: Categories, Admin, Questions, Test
npm run dev                     # http://localhost:5000
```

The exam seeder requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in your
local environment before it runs. It does not use default admin credentials.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173
```

## Routes

**Public website:** `/` (unchanged design)

**Student Portal:** `/login` `/signup` `/forgot-password` `/dashboard`
`/exam/:attemptId` `/result/:resultId`

**Admin Panel:** `/admin/login` `/admin/dashboard` `/admin/questions`
`/admin/categories` `/admin/exams` `/admin/students` `/admin/results`
`/admin/analytics`

## Key API Endpoints

| Method | Endpoint                          | Description                         |
|--------|-------------------------------------|---------------------------------------|
| POST   | /api/student/auth/signup           | Student registration                  |
| POST   | /api/student/auth/login            | Student login (JWT)                   |
| GET    | /api/exams                          | Active tests for students             |
| POST   | /api/exams/:id/start                | Start/resume a randomized attempt     |
| PATCH  | /api/attempts/:id/answer            | Auto-save a selected answer           |
| POST   | /api/attempts/:id/submit            | Submit & grade a test                 |
| POST   | /api/admin/auth/login               | Admin login (JWT)                     |
| GET/POST/PUT/DELETE | /api/admin/questions   | Question Bank CRUD                    |
| POST   | /api/admin/questions/import         | Excel/CSV bulk import                 |
| GET    | /api/admin/questions/export         | Excel export                          |
| GET    | /api/admin/questions/analytics      | Question Bank analytics               |
| GET/POST/PUT/DELETE | /api/admin/exams        | Test Generator (category distribution)|
| GET    | /api/admin/dashboard                | Dashboard summary cards               |
| GET    | /api/admin/dashboard/analytics      | Charts data                           |

## Exam Engine Notes

- Every student gets a **random 50-question paper** with **randomized
  option order**, generated server-side and stored per-attempt in MongoDB.
- The **15-minute timer** is driven by a server-issued `expiresAt`
  timestamp — refreshing or closing the browser and returning restores
  the exact remaining time; the server also auto-submits if the timer
  has expired whenever the attempt is fetched or an answer is saved.
- **Auto-save** persists every selected answer immediately.
- **One attempt only** is enforced per student per test unless the
  admin enables `allowRetest` on that test.

## Future-Ready Architecture (present, not yet wired to UI)

Negative marking, multiple-correct-answer questions, image/code-snippet
questions, certificate download, notes/assignments/attendance/video
lectures/fees/notifications — relevant model fields and folders are
already in place per the original spec.

## Security

- Passwords hashed with bcrypt.
- JWT-based auth with separate student/admin roles enforced server-side.
- All admin mutation routes require a valid admin JWT.
- express-validator on every write endpoint.
