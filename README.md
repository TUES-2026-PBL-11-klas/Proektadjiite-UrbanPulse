# UrbanPulse

A civic reporting platform for Sofia, Bulgaria — letting citizens report and track environmental issues in real time.

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 16, React 19, TypeScript, Tailwind CSS  |
| Backend   | Node.js, Express 4, Prisma 5                    |
| Database  | PostgreSQL with PostGIS (Supabase recommended)  |
| Auth      | JWT (jsonwebtoken) + bcrypt                     |
| File Storage | Multer (local `backend/uploads/` folder)     |

---

## Prerequisites

- **Node.js 18+** and **npm 9+**
- A **PostgreSQL database** with the **PostGIS extension** enabled
  - Recommended: [Supabase](https://supabase.com) free tier (PostGIS is pre-enabled)
  - Or a local PostgreSQL instance with `CREATE EXTENSION postgis;`

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values:

| Variable            | Description                                               | Example                        |
|---------------------|-----------------------------------------------------------|--------------------------------|
| `PORT`              | HTTP port the server listens on                           | `3001`                         |
| `NODE_ENV`          | Runtime environment                                       | `development`                  |
| `DATABASE_URL`      | PostgreSQL connection string (PostGIS must be enabled)    | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`        | Secret key for signing JWT tokens (any long random string)| `change-me-to-something-long`  |
| `JWT_EXPIRES_IN`    | Token lifetime                                            | `7d`                           |
| `SMTP_HOST`         | SMTP server host (use Ethereal for development)           | `smtp.ethereal.email`          |
| `SMTP_PORT`         | SMTP port                                                 | `587`                          |
| `SMTP_SECURE`       | Use TLS (`true` for port 465, `false` otherwise)          | `false`                        |
| `SMTP_USER`         | SMTP username                                             |                                |
| `SMTP_PASS`         | SMTP password                                             |                                |
| `EMAIL_FROM`        | Sender address shown in notification emails               | `"UrbanPulse <noreply@urbanpulse.app>"` |
| `AUTO_ARCHIVE_DAYS` | Days after which resolved reports are auto-archived       | `30`                           |

> **Development email**: Create a free account at [ethereal.email](https://ethereal.email) to get SMTP credentials that capture emails without actually sending them.

### 3. Push the database schema

```bash
npx prisma db push
```

This creates all tables and indexes. The PostGIS extension must already be enabled in your database before running this.

### 4. Start the server

```bash
# Development (auto-reload on file changes)
npm run dev

# Production
npm start
```

The API is available at `http://localhost:3001` (or your configured `PORT`).

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

| Variable              | Description                                       |
|-----------------------|---------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (no trailing slash)   |

### 3. Start the development server

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

---

## Available Scripts

### Backend (`cd backend`)

| Command                  | Description                                      |
|--------------------------|--------------------------------------------------|
| `npm run dev`            | Start with nodemon (auto-reload on file changes) |
| `npm start`              | Start in production mode                         |
| `npm test`               | Run unit tests with Vitest                       |
| `npm run test:watch`     | Run tests in watch mode                          |
| `npm run postman:test`   | Run Postman collection tests with Newman         |
| `npx prisma db push`     | Sync Prisma schema to database                   |
| `npx prisma studio`      | Open Prisma Studio (visual database browser)     |

### Frontend (`cd frontend`)

| Command        | Description                     |
|----------------|---------------------------------|
| `npm run dev`  | Start Next.js development server |
| `npm run build`| Build for production            |
| `npm start`    | Start production build          |
| `npm run lint` | Run ESLint                      |

---

## API Reference

| Method   | Path                             | Auth     | Description                              |
|----------|----------------------------------|----------|------------------------------------------|
| `GET`    | `/api/stats`                     | None     | Public platform statistics               |
| `POST`   | `/api/auth/register`             | None     | Register a new user                      |
| `POST`   | `/api/auth/login`                | None     | Log in and receive a JWT                 |
| `PATCH`  | `/api/auth/me`                   | Bearer   | Update display name or password          |
| `GET`    | `/api/reports`                   | None     | List reports (filterable, paginated)     |
| `POST`   | `/api/reports`                   | Bearer   | Submit a new report (multipart/form-data)|
| `GET`    | `/api/reports/:id`               | Optional | Get a single report with status history  |
| `POST`   | `/api/reports/:id/vote`          | Bearer   | Upvote a report                          |
| `DELETE` | `/api/reports/:id/vote`          | Bearer   | Remove your vote                         |
| `PATCH`  | `/api/reports/:id/status`        | Admin    | Update report status                     |
| `GET`    | `/api/admin/analytics/summary`   | Admin    | Aggregate stats (totals, resolution time)|
| `GET`    | `/api/admin/analytics/trend`     | Admin    | Weekly/monthly report trend data         |
| `GET`    | `/api/admin/analytics/reports`   | Admin    | Filtered report export (max 1000 rows)   |
| `GET`    | `/api/admin/users`               | Admin    | All users with report counts             |

---

## Notes

- **Uploaded images** are stored in `backend/uploads/` and served at `/uploads/<filename>`. In production, consider moving to object storage (e.g. S3).
- **Heat scores** on reports are recalculated by a cron job. Reports accumulate score based on vote count and age.
- **Auto-archive**: Reports are automatically archived after `AUTO_ARCHIVE_DAYS` days once resolved.
- **Admin accounts** must be created directly in the database — set `role = 'admin'` on the user row (e.g. via Prisma Studio or a SQL query). There is no admin registration UI.
- **Report categories**: `illegal_dump`, `air_pollution`, `water_pollution`, `broken_container`, `other`
- **Report statuses**: `submitted` → `in_progress` → `resolved` → `archived`
