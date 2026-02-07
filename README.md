# Collaborative Task Manager

This repository contains a full-stack Task Management app (frontend + backend) implemented with TypeScript, Next.js, Tailwind CSS, Express, Prisma (Postgres), Socket.io, and more.
This project was built to satisfy the "Collaborative Task Manager: Full-Stack Engineering Assessment" requirements.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAnmol1085%2Ftask-manager%2Ftree%2Fmain%2Ffrontend)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Anmol1085/task-manager)

## 🏗️ Architecture Overview

The application follows a modular, layered architecture to ensure separation of concerns and maintainability.

### Backend (`/backend`)

- **Controller Layer (`src/routes`)**: Handles HTTP requests, input validation (Zod), and response formatting.
- **Service Layer (`src/services`)**: Contains business logic (e.g., task creation, notification dispatch). This layer is decoupled from the HTTP transport.
- **Data Access Layer (Prisma)**: Manages database interactions using Prisma ORM with PostgreSQL.
- **Real-Time Layer (Socket.io)**: Integrated directly with the Express server to push updates (`taskUpdated`, `taskAssigned`) to connected clients.

### Frontend (`/frontend`)

- **Framework**: Next.js (Pages Router) used for routing and rendering.
- **State Management**: `@tanstack/react-query` (v5) handles server state, caching, and background revalidation.
- **Styling**: Tailwind CSS (v4) with a custom "Indigo Slate" design system for a polished, professional UI.
- **Real-Time**: `socket.io-client` listens for events and triggers React Query invalidations to update the UI instantly.

## 🚀 API Contract

### Authentication

- `POST /api/auth/register`: Register a new user.
  - Body: `{ email, password, name }`
- `POST /api/auth/login`: Authenticate user.
  - Body: `{ email, password }`
  - Returns: HttpOnly cookies (`accessToken`, `refreshToken`).
- `GET /api/auth/me`: Get current user profile.

### Tasks

- `GET /api/tasks`: Fetch all tasks (supports filtering/sorting).
- `POST /api/tasks`: Create a new task.
  - Body: `{ title, description, priority, dueDate, assignedToId? }`
- `PUT /api/tasks/:id`: Update a task.
- `DELETE /api/tasks/:id`: Delete a task.

## ⚡ Real-Time Collaboration

Socket.io is used to enable real-time features:

1.  **Live Updates**: When a task is updated, the backend emits a `taskUpdated` event. Clients listening to this event automatically refetch the task list.
2.  **Assignment Notifications**: When a user is assigned a task, the backend emits a `taskAssigned` event to their specific socket room (`io.to(userId)`).

## 🛠️ Local Setup

### Prerequisites

- Node.js (18+)
- Docker (for PostgreSQL)

### 1. Database & Backend

```bash
cd backend
# Start Postgres
docker-compose up -d

# Install dependencies
npm install

# Setup Database
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Run Backend (Port 5001)
npm run dev
```

### 2. Frontend

```bash
cd frontend
# Install dependencies
npm install

# Run Frontend (Port 3000)
npm run dev
```

## 🧪 Testing

The backend includes unit tests for critical business logic using Jest.
Run tests: `cd backend && npm test`
