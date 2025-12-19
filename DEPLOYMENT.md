# Deployment Guide

This document describes how to deploy the frontend (Next.js) to Vercel and the backend (Express + Prisma) to Render or Railway. It includes recommended environment variables, GitHub Actions templates and notes about running database migrations.

## Overview
- Frontend: Vercel (recommended) — automatic Next.js builds.
- Backend: Render or Railway (recommended) — PostgreSQL managed DB.

## Required environment variables
Set these secrets in your hosting provider (Render/Railway) and in GitHub Actions as repository secrets.

Backend (`backend` service):
- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@host:5432/dbname`)
- `JWT_SECRET` — strong random string for signing access tokens
- `FRONTEND_URL` — frontend origin (e.g. `https://your-frontend.vercel.app`)
- `PORT` — optional, default `5000`

Frontend (Vercel project environment variables):
- `NEXT_PUBLIC_BACKEND_URL` — e.g. `https://your-backend.onrender.com` (or your Railway/Render URL)

GitHub repository secrets (for CI deploy):
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (for Vercel action)
- `RENDER_API_KEY`, `RENDER_SERVICE_ID` (for Render deploy action) OR Railway deploy key if using Railway

## Deploy Backend to Render (recommended)
1. Create a new Web Service on Render and connect your GitHub repository.
2. Choose Docker or the `Node` environment. If using Docker, `backend/Dockerfile` is provided.
3. Set the environment variables listed above in the Render service settings.
4. Configure the start command (if not using Docker) to run migrations then start:
   - `npx prisma migrate deploy && npm run build && npm run start`
5. Optionally add a health check endpoint in the Render settings (e.g., `/api/health`).

## Deploy Frontend to Vercel
1. Create a Vercel project and connect the `frontend/` directory of this repo (or the whole repo and set output dir).
2. Add `NEXT_PUBLIC_BACKEND_URL` to the Vercel Environment Variables.
3. Vercel will build automatically on push to `main`.

## GitHub Actions (CI + Deploy templates)
- We include a CI workflow (`.github/workflows/ci.yml`) which builds and tests. Below is a deploy template that you can enable by adding secrets.

### Example deploy workflow (uses Vercel + Render)
Add `.github/workflows/deploy.yml` with secrets described above. The workflow will build and deploy frontend via Vercel and then trigger a Render deployment for the backend.

## Database migrations in CI / on Render
- Use `npx prisma migrate deploy` in your Render Start Command before starting the server. This ensures migrations are applied on deployment.
- Alternatively, run migrations manually via an admin job in your hosting provider.

## Railway notes
- If you prefer Railway, create a project, add a Postgres plugin, and set the `DATABASE_URL` accordingly. Configure the backend service to deploy from GitHub and set the same start command or Dockerfile.

## Post-deploy checklist
- Visit the frontend URL and sign in (use seeded user or register).
- Verify that creating a task triggers a notification to the assigned user.
- Check logs for errors (migrations, environment variables, CORS issues).

If you want, I can add a `.github/workflows/deploy.yml` that automatically deploys using the secrets you provide — say the word and I'll add the file with placeholders for secrets.
