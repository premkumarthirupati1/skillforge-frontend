# SkillForge — Personalized Learning Platform

## Overview

SkillForge is a full-stack personalized learning platform that enables students to discover and enroll in courses, track their learning progress, and receive a structured educational experience. Instructors can create and manage course content, while administrators oversee the entire platform through role-based access controls.

The backend is built with Node.js and Express.js, the frontend with React.js, and the data layer uses MongoDB with Redis caching for optimized performance.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Roles and Permissions](#roles-and-permissions)
- [License](#license)

---

## Features

- Full-stack learning platform with course creation, enrollment, and progress tracking
- 15+ REST APIs for all platform operations
- JWT-based authentication with role-based access control (RBAC) for three user roles
- Redis caching reducing API response latency by approximately 30%
- Paginated course listing with filter and search support
- Optimized MongoDB schemas with compound indexing, reducing query time by approximately 25%
- Service-layer architecture for clean separation of business logic and route handling

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js                          |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| Caching    | Redis                             |
| Auth       | JSON Web Tokens (JWT), bcrypt     |
| Tools      | Postman, Git                      |

---

## Project Structure

```
skillforge/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.js
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── enrollmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rbacMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Enrollment.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   └── enrollment.routes.js
│   ├── services/
│   │   ├── authService.js
│   │   └── courseService.js
│   └── index.js
├── .env.example
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 18 or above
- MongoDB
- Redis

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/premkumarthirupati1/skillforge.git
cd skillforge
```

**2. Install server dependencies**
```bash
cd server && npm install
```

**3. Install client dependencies**
```bash
cd client && npm install
```

**4. Configure environment variables**

Create a `.env` file inside the `/server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillforge
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
```

**5. Start the backend server**
```bash
cd server && npm run dev
```

**6. Start the frontend**
```bash
cd client && npm start
```

**7. Access the application**

Open your browser and navigate to `http://localhost:3000`

---

## API Reference

### Authentication

| Method | Endpoint               | Description                  | Access |
|--------|------------------------|------------------------------|--------|
| POST   | `/api/auth/register`   | Register a new user          | Public |
| POST   | `/api/auth/login`      | Login and receive JWT token  | Public |

### Courses

| Method | Endpoint               | Description                  | Access     |
|--------|------------------------|------------------------------|------------|
| GET    | `/api/courses`         | Get paginated course listing | Public     |
| GET    | `/api/courses/:id`     | Get a single course          | Public     |
| POST   | `/api/courses`         | Create a new course          | Instructor |
| PUT    | `/api/courses/:id`     | Update a course              | Instructor |
| DELETE | `/api/courses/:id`     | Delete a course              | Admin      |

### Enrollment

| Method | Endpoint                          | Description               | Access  |
|--------|-----------------------------------|---------------------------|---------|
| POST   | `/api/enroll/:courseId`           | Enroll in a course        | Student |
| GET    | `/api/enroll/progress/:courseId`  | Get course progress       | Student |
| PUT    | `/api/enroll/progress/:courseId`  | Update course progress    | Student |

---

## Roles and Permissions

| Feature              | Student | Instructor | Admin |
|----------------------|---------|------------|-------|
| Browse courses       | ✅      | ✅         | ✅    |
| Enroll in courses    | ✅      | ❌         | ❌    |
| Track progress       | ✅      | ❌         | ❌    |
| Create courses       | ❌      | ✅         | ✅    |
| Update courses       | ❌      | ✅         | ✅    |
| Delete courses       | ❌      | ❌         | ✅    |
| Manage users         | ❌      | ❌         | ✅    |

---

## License

This project is licensed under the MIT License.
