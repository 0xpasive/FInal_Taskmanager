# Task Manager Application

A full-stack Task Manager application for teams, built with React (frontend), Node.js/Express (backend), and MongoDB. It supports user authentication, task management with file uploads and comments, and team collaboration features.

## Table of Contents
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Setup](#setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Specification](#api-specification)
- [Dependencies](#dependencies)

## Features
- User authentication (signup, login, password change)
- Task CRUD operations with file uploads and comments
- Team creation, member management, and invitations
- Responsive dashboard for managing tasks and teams

## Directory Structure
```
├── backend/         # Express.js backend API
├── frontend/        # React frontend (Vite)
```

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (see [Environment Variables](#environment-variables)).
4. Ensure MongoDB is running and accessible.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables
### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend
No environment variables required by default. If your backend runs on a different host/port, update API URLs in the frontend code accordingly.

## Running the Application
### Start Backend
From the `backend` directory:
```bash
node server.js
```
Or, for development with auto-reload:
```bash
npx nodemon server.js
```

### Start Frontend
From the `frontend` directory:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173` by default (Vite).

## API Specification

### Authentication (`/api/auth`)
| Method | Endpoint                | Auth Required | Description                |
|--------|-------------------------|--------------|----------------------------|
| POST   | `/signup`               | No           | Register a new user        |
| POST   | `/login`                | No           | Login and get JWT token    |
| GET    | `/user`                 | Yes          | Get current user details   |
| GET    | `/user/:id`             | No           | Get user details by ID     |
| PUT    | `/user/change-password` | Yes          | Change user password       |

### Tasks (`/api/tasks`)
| Method | Endpoint                        | Auth Required | Description                        |
|--------|----------------------------------|--------------|------------------------------------|
| POST   | `/create`                        | Yes          | Create a new task (with files)     |
| GET    | `/myTasks`                       | Yes          | Get all tasks for the user         |
| POST   | `/update/:taskId`                | Yes          | Update a task                      |
| DELETE | `/delete/:taskId`                | Yes          | Delete a task                      |
| POST   | `/close/:taskId`                 | Yes          | Mark a task as completed           |
| POST   | `/:taskId/comments`              | Yes          | Add comment(s) to a task (files)   |
| GET    | `/:taskId/comments`              | Yes          | Get comments for a task            |
| DELETE | `/:taskId/comments/:commentId`   | Yes          | Delete a comment                   |

### Teams (`/api/teams`)
| Method | Endpoint              | Auth Required | Description                          |
|--------|-----------------------|--------------|--------------------------------------|
| POST   | `/create`             | Yes          | Create a new team                    |
| GET    | `/myTeams`            | Yes          | Get all teams for the user           |
| POST   | `/add/:teamId`        | Yes          | Add a member to a team               |
| POST   | `/remove/:teamId`     | Yes          | Remove a member from a team          |
| POST   | `/users`              | Yes          | Get all users                        |
| POST   | `/delete/:id`         | Yes          | Delete a team                        |
| GET    | `/invitations`        | Yes          | Get user's team invitations          |
| POST   | `/accept`             | Yes          | Accept a team invitation             |
| POST   | `/reject`             | Yes          | Reject a team invitation             |

#### Notes
- All endpoints (except signup, login, and public user details) require a JWT token in the `Authorization` header: `Bearer <token>`
- File uploads use `multipart/form-data` (see `/tasks/create` and `/tasks/:taskId/comments`)

## Frontend Overview
- Built with React and Vite for fast development and HMR
- Uses React Router for navigation (Login, Signup, Dashboard, Profile)
- Dashboard: Manage tasks, create new tasks, view teams, and notifications
- Profile: View and update user info, change password, logout
- Responsive and styled with Tailwind CSS

## Dependencies
### Backend
- express
- mongoose
- dotenv
- cors
- jsonwebtoken
- bcryptjs
- multer
- axios
- nodemon (dev)

### Frontend
- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- react-toastify
- lucide-react
- @headlessui/react
- @tailwindcss/vite
- vite
- eslint (dev)

---

For more details, see the source code in each route/controller and frontend component. 
