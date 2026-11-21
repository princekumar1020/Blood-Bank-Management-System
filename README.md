# Blood Bank Management System

One-line summary: A MERN full-stack Blood Bank Management System (API + React UI).

## Prerequisites
- Node.js (>=16) and npm
- MongoDB (local or Atlas)
- Optional: Docker for containerized runs

## Quick setup (development)
Run backend and frontend in separate terminals.

Backend (API)

```bash
cd backend
npm install
# dev with auto-reload
npm run dev
# or start normally
npm start
```

Notes:
- Backend entrypoint: [backend/index.js](backend/index.js#L1-L200)
- Default port: `5000` (env `PORT` can override)
- DB env: `MONGODB_URI` or `MONGO_URI` (falls back to `mongodb://localhost/bloodbank`)

Frontend (React)

```bash
cd frontend
npm install
npm start
```

Notes:
- Frontend scripts: [frontend/package.json](frontend/package.json#L1-L200)
- `npm start` runs the React dev server (CRA). Default port is usually `3000`.

## Environment variables
Create a `.env` in `/backend` or set environment variables. Example keys:

```
MONGODB_URI=
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_USER=you@example.com
EMAIL_PASS=app-password
```

Consider adding `/backend/.env.example` and NOT committing real secrets.

## Seed data
There is a `scripts/` folder with example seeding; you can add or run a seed script to populate test users, inventory, and requests.

## Run checklist before demo or interview
- Ensure MongoDB is running or configured (Atlas connection string in `MONGODB_URI`).
- Run `npm install` in both `/backend` and `/frontend`.
- Start backend then frontend and open the UI in the browser.

## Screenshots / Demo
- Add screenshots under `docs/screenshots/` and reference them here.

## Helpful next steps to make this placement-ready
- Add `backend/.env.example` (examples of required env keys)
- Add `scripts/seed.js` to populate demo data
- Add basic tests with Jest + Supertest for core APIs
- Add CI (GitHub Actions) to run lint and tests on PRs
- Add Dockerfile and `docker-compose.yml` for reproducible local development

If you want, I can add `/backend/.env.example` and a simple `scripts/seed.js` next — which should I create first?