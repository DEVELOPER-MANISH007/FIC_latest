# Future IT College — MERN Stack Application

Full-stack institute website with **Student Portal**, **Online Examination System**, and **Admin Panel** (Question Bank, Test Generator, Analytics). Built with a consistent UI/UX, animations, and production-ready Vercel deployment.

---

## Developer

| | |
|---|---|
| **Owner / Developer** | [**Manish Kumar (DEVELOPER-MANISH007)**](https://github.com/DEVELOPER-MANISH007) |
| **GitHub** | [github.com/DEVELOPER-MANISH007](https://github.com/DEVELOPER-MANISH007) |
| **Role** | Full-Stack Developer |
| **Location** | Greater Noida, India |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query, Recharts |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT |
| **Auth** | bcrypt, JSON Web Tokens (Student + Admin roles) |
| **Uploads** | Multer, Cloudinary (production) |
| **Email** | Nodemailer |
| **Deployment** | Vercel (Client + Server) |

---

## Project Structure

```
FIC_latest/
├── client/                          # React frontend (Vite + TypeScript)
│   ├── public/                      # Static public assets
│   ├── src/
│   │   ├── assets/images/           # Images (logo, banners, etc.)
│   │   ├── components/
│   │   │   ├── admin/               # Admin panel UI components
│   │   │   ├── auth/                # Login / signup forms
│   │   │   ├── common/              # Shared UI (Button, Reveal, etc.)
│   │   │   ├── exam/                # Exam timer, question palette
│   │   │   ├── layout/              # Navbar, Footer
│   │   │   ├── sections/            # Landing page sections
│   │   │   └── student/             # Student portal layout
│   │   ├── constants/               # Site data & config
│   │   ├── context/                 # Auth context
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/
│   │   │   ├── admin/               # Admin dashboard, questions, exams…
│   │   │   └── student/             # Student dashboard, exam, results…
│   │   ├── services/api/            # Axios API service layer
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # Helper utilities
│   ├── .env.example
│   ├── vercel.json                  # SPA routing for Vercel
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # Express backend API
│   ├── api/
│   │   └── index.js                 # Vercel serverless entry point
│   ├── config/
│   │   ├── db.js                    # MongoDB connection (serverless-safe)
│   │   └── cloudinary.js            # Cloudinary config
│   ├── controllers/                 # Route handlers
│   ├── middleware/
│   │   ├── auth.js                  # JWT protection
│   │   ├── ensureDb.js              # DB connect before API calls
│   │   ├── errorHandler.js
│   │   └── upload*.js               # File upload middleware
│   ├── models/                      # Mongoose schemas
│   ├── routes/                      # Express route definitions
│   ├── seed/                        # Database seed scripts
│   ├── services/                    # Email service, etc.
│   ├── utils/                       # Helpers (shuffle, excel, JWT…)
│   ├── validators/                  # express-validator schemas
│   ├── app.js                       # Express app (Vercel-compatible)
│   ├── server.js                    # Local dev server entry
│   ├── vercel.json                  # Vercel API routing
│   ├── .env.example
│   └── package.json
│
├── package.json                     # Root scripts (dev, build, seed)
└── README.md
```

---

## Features

### Public Website
- Home, About, Courses, Faculty, Gallery, Facilities
- Admission form, Contact form
- Responsive design with animations
- **Notes Library** — Public study notes browsable and downloadable from the home page, no login required (`#notes`)

### Student Portal
- Signup / Login / Forgot Password
- Dashboard, profile & photo upload
- Online exams with live timer & auto-save
- Results & attempt history
- Study Material — browse/search/filter by Subject, preview PDFs inline, download files (Public + their own Enrolled-Only material)

### Admin Panel
- Secure admin login (JWT)
- Question Bank (CRUD + Excel import/export)
- Category management
- Test generator with category-wise question distribution
- Student management, including **Reset Password** for any student (no old password required)
- Results & analytics dashboard
- Study Material Management — upload/edit/delete PDF/ZIP/DOC(X)/PPT(X)/image materials by **Subject → Topic → Unit**, with visibility control (Public / Enrolled Students Only). No Course selection required.

### Exam Engine
- Random **50-question paper** per student with shuffled options
- **15-minute server-side timer** — survives page refresh
- **Auto-save** on every answer selection
- **One attempt per test** (unless admin enables retest)
- Auto-submit when timer expires

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas or local MongoDB

### 1. Clone the repository

```bash
git clone https://github.com/DEVELOPER-MANISH007/FIC_latest.git
cd FIC_latest
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env        # Edit MONGODB_URI, JWT_SECRET, etc.
npm run seed                # Seed website content
npm run seed:exam           # Seed exam module (admin, questions, test)
npm run migrate:study-material  # One-time: backfill subject/unit on any pre-existing Study Material records
npm run dev                 # http://localhost:5000
```

Default admin login after `seed:exam`:
- **Email:** `admin@futureitcollege.com`
- **Password:** `Admin@123`

> **Upgrading an existing deployment?** Study Material records now use a
> `subject` / `unit` structure instead of the earlier Course selection. Run
> `npm run migrate:study-material` once after deploying — it backfills those
> two fields on any older records (from `subjectName`/`courseName`/`module`)
> without deleting anything, and is safe to re-run.

### 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

### 4. Run both together (from root)

```bash
npm install
npm run dev
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `CLIENT_URL` | Yes | Frontend URL(s), comma-separated for CORS |
| `CLOUDINARY_CLOUD_NAME` | Prod | Cloudinary cloud name (profile photos + Study Material files) |
| `CLOUDINARY_API_KEY` | Prod | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Prod | Cloudinary API secret |
| `EMAIL_HOST` | No | SMTP host for notifications |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (e.g. `http://localhost:5000/api`) |
| `VITE_SERVER_URL` | Backend base URL (e.g. `http://localhost:5000`) |

---

## Deploy on Vercel

Deploy **client** and **server** as two separate Vercel projects.

### Backend (Server)

| Setting | Value |
|---------|-------|
| Root Directory | `server` |
| Framework | Other |
| Build Command | *(leave empty)* |
| Output Directory | *(leave empty)* |

Add all server environment variables from the table above in **Vercel → Settings → Environment Variables**.

In **MongoDB Atlas → Network Access**, allow `0.0.0.0/0` (Vercel uses dynamic IPs).

Test after deploy: `https://your-api.vercel.app/api/health`

### Frontend (Client)

| Setting | Value |
|---------|-------|
| Root Directory | `client` |
| Build Command | `pnpm run build` |
| Output Directory | `dist` |

Set client env vars:

```
VITE_API_BASE_URL=https://your-api.vercel.app/api
VITE_SERVER_URL=https://your-api.vercel.app
```

Set on the **server** project:

```
CLIENT_URL=https://your-frontend.vercel.app
```

---

## Routes

### Frontend

| Section | Routes |
|---------|--------|
| **Public** | `/` (includes the `#notes` Notes Library section) |
| **Student** | `/login`, `/signup`, `/forgot-password`, `/dashboard`, `/dashboard/study-material`, `/exam/:attemptId`, `/result/:resultId` |
| **Admin** | `/admin/login`, `/admin/dashboard`, `/admin/questions`, `/admin/categories`, `/admin/exams`, `/admin/students`, `/admin/students/:id`, `/admin/results`, `/admin/analytics`, `/admin/study-materials` |

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/student/auth/signup` | Student registration |
| POST | `/api/student/auth/login` | Student login |
| GET | `/api/exams` | Active tests for students |
| POST | `/api/exams/:id/start` | Start/resume exam attempt |
| PATCH | `/api/attempts/:id/answer` | Auto-save answer |
| POST | `/api/attempts/:id/submit` | Submit & grade test |
| POST | `/api/admin/auth/login` | Admin login |
| GET/POST/PUT/DELETE | `/api/admin/questions` | Question Bank CRUD |
| POST | `/api/admin/questions/import` | Excel/CSV bulk import |
| GET | `/api/admin/questions/export` | Excel export |
| GET/POST/PUT/DELETE | `/api/admin/exams` | Test management |
| GET | `/api/admin/dashboard` | Dashboard summary |
| GET | `/api/admin/dashboard/analytics` | Charts data |
| PATCH | `/api/admin/students/:id/reset-password` | Admin resets a student's password (no old password needed) |
| GET | `/api/public/materials` | **Notes Library** — Public study materials, no login required |
| GET | `/api/public/materials/subjects` | Distinct subjects among Public materials |
| GET | `/api/public/materials/:id` | Single Public material (404 if not Public) |
| POST | `/api/public/materials/:id/download` | Register a download on a Public material, no login required |
| GET | `/api/materials` | Browse study materials — Public + own Enrolled-Only (student, auth required) |
| GET | `/api/materials/subjects` | Distinct subjects visible to the student (student, auth required) |
| GET | `/api/materials/:id` | Single study material (student, auth required) |
| POST | `/api/materials/:id/download` | Register a download + get file URL (student) |
| GET/POST/PUT/DELETE | `/api/admin/materials` | Study Material CRUD — Subject/Topic/Unit structure (admin) |
| GET | `/api/admin/materials/subjects` | Distinct subjects in use (admin) |

> Legacy Course/Subject catalogue endpoints (`/api/study-courses`,
> `/api/admin/study-courses`) remain in the codebase for backward
> compatibility with any earlier integrations, but are no longer used by the
> Study Material upload form.


---

## Security

- Passwords hashed with **bcrypt**
- **JWT** auth with separate student/admin roles
- All admin mutation routes require valid admin token
- **express-validator** on every write endpoint
- **Helmet** + **CORS** configured for production

---

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | root / server / client | Start dev server |
| `npm run build` | client | Production build |
| `npm run seed` | server | Seed website content |
| `npm run seed:exam` | server | Seed exam module |
| `npm start` | server | Start production server locally |

---

## License

This project is developed and maintained by [**Manish Kumar**](https://github.com/DEVELOPER-MANISH007).

---

<p align="center">
  Built with ❤️ by
  <a href="https://github.com/DEVELOPER-MANISH007"><strong>DEVELOPER-MANISH007</strong></a>
</p>
