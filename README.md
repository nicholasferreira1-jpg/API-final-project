## Project Overview

This API solves a real-world proble: many people set goals but struggle to stay consistent and accountable. The Goal Tracker API provides a structured system to set goals, define steps, and monitor progress all in one place. Whether it's fitness, education, career, or personal goals, this API helps users stay on track and measure their progress.

## Features

- JWT based authentication and authorization
- Role based access control (user and admin)
- Full CRUD operations for users, goals, and progress
- Goal filtering by category and status
- Ownership checks to protect user data
- CASCADE deletion — deleting a user removes all their goals and progress
- Password hashing with bcrypt

## Tech Stack

- **Node.js** with **Express.js**
- **Sequelize ORM** with **SQLite** (local) and **PostgreSQL** (production)
- **Jest** and **Supertest** for testing
- **bcryptjs** for password hashing
- **jsonwebtoken** for authentication

## Getting Started

### Prerequisites
- Node.js installed
- npm installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nicholasferreira1-jpg/API-final-project.git
cd API-final-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
DB_NAME=goaltracker.db

4. Set up the database:
```bash
npm run setup
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the server:
```bash
npm start
```

The API will be running at `http://localhost:3000`

### Running Tests
```bash
npm test
```

---

## Authentication

This API uses JSON Web Tokens (JWT) for authentication. After logging in, the server returns a token that must be included in the Authorization header of every protected request.
Authorization: Bearer (your token)

### Register
Create a new user account by sending a POST request to `/api/register` with your name, email, password, and role.

### Login
Send a POST request to `/api/login` with your email and password. The server will return a JWT token. Copy this token and include it in the Authorization header of every subsequent request.

### Logout
Send a POST request to `/api/logout`. Since JWT tokens are stateless, the client is responsible for discarding the token after logout.

---

## User Roles

The API has two user roles:

### User
- Can register and login
- Can view and manage their own goals and progress only
- Can view and update their own account only
- Cannot access other users data
- Cannot access admin only endpoints

### Admin
- Has full access to all users, goals, and progress
- Can view, update, and delete any user account
- Can view, update, and delete any goal or progress step
- Can promote a regular user to admin by updating their role
- Can see all data across all users

---

## Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | STRING | User's full name |
| email | STRING | Unique email address |
| password | STRING | Hashed password |
| role | STRING | user or admin |

### Goals
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| title | STRING | Goal title |
| description | TEXT | Goal description |
| category | STRING | fitness, education, personal, career, finance, other |
| targetDate | DATEONLY | Target completion date |
| status | STRING | active, completed, or abandoned |
| userId | INTEGER | Foreign key to Users |

### Progress
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| step | STRING | Step description |
| notes | TEXT | Additional notes |
| completed | BOOLEAN | Whether step is done |
| completedAt | DATE | When step was completed |
| goalId | INTEGER | Foreign key to Goals |

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register a new user account |
| POST | /api/login | Login and receive a JWT token |
| POST | /api/logout | Logout and discard token |

#### POST /api/register - Request Body
```json
{
    "name": "Nicholas Carter",
    "email": "nicholas@example.com",
    "password": "password123",
    "role": "user"
}
```

#### POST /api/register - Response
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "Nicholas Carter",
        "email": "nicholas@example.com",
        "role": "user"
    }
}
```

#### POST /api/login - Request Body
```json
{
    "email": "nicholas@example.com",
    "password": "password123"
}
```

#### POST /api/login - Response
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "Nicholas Carter",
        "email": "nicholas@example.com",
        "role": "user"
    }
}
```

---

### Users (Protected)

All endpoints require a valid JWT token in the Authorization header.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/users | Admin only | Get all users |
| GET | /api/users/:id | Admin or own account | Get a single user |
| PUT | /api/users/:id | Admin or own account | Update a user |
| DELETE | /api/users/:id | Admin only | Delete a user |

#### PUT /api/users/:id - Request Body
```json
{
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin"
}
```

---

### Goals (Protected)

All endpoints require a valid JWT token in the Authorization header.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/goals | User sees own, Admin sees all | Get all goals |
| GET | /api/goals/:id | Admin or owner | Get a single goal |
| GET | /api/goals/category/:category | User sees own, Admin sees all | Get goals by category |
| GET | /api/goals/status/:status | User sees own, Admin sees all | Get goals by status |
| POST | /api/goals | Any logged in user | Create a new goal |
| PUT | /api/goals/:id | Admin or owner | Update a goal |
| DELETE | /api/goals/:id | Admin or owner | Delete a goal |

#### POST /api/goals - Request Body
```json
{
    "title": "Read 12 Books This Year",
    "description": "Read at least one book per month",
    "category": "education",
    "targetDate": "2026-12-31",
    "status": "active"
}
```

#### POST /api/goals - Response
```json
{
    "message": "Goal created successfully",
    "goal": {
        "id": 1,
        "title": "Read 12 Books This Year",
        "category": "education",
        "status": "active",
        "userId": 1
    }
}
```

**Valid categories:** `fitness`, `education`, `personal`, `career`, `finance`, `other`

**Valid statuses:** `active`, `completed`, `abandoned`

---

### Progress (Protected)

All endpoints require a valid JWT token in the Authorization header.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/progress | User sees own, Admin sees all | Get all progress steps |
| GET | /api/progress/:id | Admin or owner | Get a single progress step |
| POST | /api/progress | Any logged in user | Create a new progress step |
| PUT | /api/progress/:id | Admin or owner | Update a progress step |
| DELETE | /api/progress/:id | Admin or owner | Delete a progress step |

#### POST /api/progress - Request Body
```json
{
    "step": "Read Atomic Habits",
    "notes": "Great book about building habits",
    "completed": false,
    "goalId": 1
}
```

#### POST /api/progress - Response
```json
{
    "message": "Progress step created successfully",
    "progress": {
        "id": 1,
        "step": "Read Atomic Habits",
        "completed": false,
        "goalId": 1
    }
}
```

---

## Error Handling

The API returns appropriate HTTP status codes:

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / missing fields |
| 401 | Unauthorized / no token provided |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

### Error Response Format
```json
{
    "error": "Description of what went wrong"
}
```

### Authorization Error Examples

**401 - No token:**
```json
{
    "error": "Access denied. No token provided."
}
```

**403 - Wrong role:**
```json
{
    "error": "Access denied. You can only access your own data."
}
```

---

## Deployment

This API is deployed on Render. The production environment uses PostgreSQL for persistent data storage.

**Production URL:** `https://goal-tracker-2eug.onrender.com`
