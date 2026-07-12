# Kole District Corruption Reporting System

This repository contains a full-stack corruption reporting platform for Kole District.

## Repository Layout

- `backend/` - Django API and admin backend
- `frontend/` - React + Vite public web application
- `docker-compose.yml` - local development services (Postgres, Redis, backend, celery, frontend)

## Environment configuration

### Backend

- The backend reads runtime settings from environment variables.
- A sample file is provided at `backend/.env.example`.
- For development, set values such as `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `REDIS_URL`, and `CORS_ALLOWED_ORIGINS`.

### Frontend

- The frontend reads `VITE_API_URL` from `frontend/.env` to locate the backend API.
- In local development this is typically set to `http://localhost:8000/api`.

## Offline report sync

- The frontend stores offline drafts in the browser using `localforage` under the key `offline_reports`.
- When the browser regains connectivity, the app automatically retries sending stored reports.
- Uploaded attachments are preserved across offline storage as base64-encoded file data and rebuilt into `FormData` on reconnect.

## Quick start

1. Copy `backend/.env.example` to `backend/.env` and update as needed.
2. Copy `frontend/.env` from the existing frontend `.env` and confirm `VITE_API_URL` points to the backend.
3. Start services with `docker-compose up --build`.
4. Access the frontend in a browser on `http://localhost` and the backend API on `http://localhost:8000/api`.
