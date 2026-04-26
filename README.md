# API-final-project

A REST API for tracking personal goals and progress. Users can create goals, break them down into steps, and track their progress over time.

## Project Overview

This API solves a real-world problem — many people set goals but struggle to stay consistent and accountable. The Goal Tracker API provides a structured system to set goals, define steps, and monitor progress all in one place.

## Tech Stack

- **Node.js** with **Express.js**
- **Sequelize ORM** with **SQLite** database
- **Jest** and **Supertest** for testing

## Getting Started

### Prerequisites
- Node.js installed
- npm installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/goal-tracker-api.git
cd goal-tracker-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key

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

## Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | STRING | User's full name |
| email | STRING | Unique email address |
| password | STRING | User's password |
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

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get a single user |
| POST | /api/users | Create a new user |
| PUT | /api/users/:id | Update a user |
| DELETE | /api/users/:id | Delete a user |

#### POST /api/users - Request Body
```json
{
    "name": "Nicholas Carter",
    "email": "nicholas@example.com",
    "password": "password123",
    "role": "user"
}
```

#### POST /api/users - Response
```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "name": "Nicholas Carter",
        "email": "nicholas@example.com",
        "role": "user"
    }
}
```

---

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/goals | Get all goals |
| GET | /api/goals/:id | Get a single goal |
| POST | /api/goals | Create a new goal |
| PUT | /api/goals/:id | Update a goal |
| DELETE | /api/goals/:id | Delete a goal |

#### POST /api/goals - Request Body
```json
{
    "title": "Read 12 Books This Year",
    "description": "Read at least one book per month",
    "category": "education",
    "targetDate": "2025-12-31",
    "status": "active",
    "userId": 1
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

---

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/progress | Get all progress steps |
| GET | /api/progress/:id | Get a single progress step |
| POST | /api/progress | Create a new progress step |
| PUT | /api/progress/:id | Update a progress step |
| DELETE | /api/progress/:id | Delete a progress step |

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
| 404 | Resource not found |
| 500 | Internal server error |

### Error Response Format
```json
{
    "error": "Description of what went wrong"
}
```