# User Management API

A production-ready REST API for user management built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **CRUD Operations**: Create, Read, Update, Delete users
- **Pagination**: Efficient data retrieval with pagination support
- **Data Encryption**: Sensitive data (Aadhar, PAN) encrypted using AES-256-GCM
- **Input Validation**: Zod schema validation with detailed error messages
- **Rate Limiting**: Protection against abuse with IP-based rate limiting
- **CORS Support**: Configurable cross-origin resource sharing
- **Soft Delete**: User data preserved for audit trails
- **Type Safety**: Full TypeScript implementation
- **Comprehensive Tests**: 14 test cases covering all endpoints
- **Database Indexing**: Optimized queries with strategic indexes

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Security**: express-rate-limit, cors, crypto

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Ashrithiiitdm/Open_hearing_assignment.git
cd Open_hearing_assignment
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Configure your `.env` file** (see [Environment Variables](#-environment-variables))

5. **Generate Prisma Client**

```bash
npx prisma generate
```

6. **Run database migrations**

```bash
npx prisma migrate deploy
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Server Configuration
PORT=8000

# Encryption Key (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Generating Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `ENCRYPTION_KEY` in the `.env` file.

## Database Setup

1. **Create PostgreSQL Database**

```bash
createdb user_service
```

2. **Run Migrations**

```bash
npx prisma migrate dev
```

3. **Verify Database**

```bash
npx prisma studio
```

This opens a browser-based database viewer at `http://localhost:5555`

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

Server starts at `http://localhost:8000`

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start the server
npm start
```

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
    "success": true,
    "message": "Server is healthy",
    "timestamp": "2025-12-18T10:30:00.000Z"
}
```

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints

#### 1. Create User

**POST** `/api/users`

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "primaryMobile": "9876543210",
    "secondaryMobile": "9876543211",
    "aadhar": "123456789012",
    "pan": "ABCDE1234F",
    "dateOfBirth": "1990-01-01",
    "placeOfBirth": "Mumbai",
    "currentAddress": "123 Main Street, Mumbai",
    "permanentAddress": "123 Main Street, Mumbai"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "User created successfully"
}
```

**Error Response (400):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "email",
            "message": "Invalid email address"
        }
    ]
}
```

**Error Response (409):**

```json
{
    "success": false,
    "message": "Email already exists"
}
```

---

#### 2. Get All Users (Paginated)

**GET** `/api/users?page=1&limit=10`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Success Response (200):**

```json
{
    "success": true,
    "message": "Users fetched successfully",
    "data": {
        "data": [
            {
                "id": "uuid-here",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "primaryMobile": "9876543210",
                "secondaryMobile": "9876543211",
                "dateOfBirth": "1990-01-01T00:00:00.000Z",
                "placeOfBirth": "Mumbai",
                "currentAddress": "123 Main Street, Mumbai",
                "permanentAddress": "123 Main Street, Mumbai",
                "createdAt": "2025-12-18T10:00:00.000Z"
            }
        ],
        "pagination": {
            "total": 50,
            "page": 1,
            "limit": 10,
            "totalPages": 5
        }
    }
}
```

---

#### 3. Get User by ID

**GET** `/api/users/:user_id`

**Success Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    ...
  }
}
```

**Error Response (404):**

```json
{
    "success": false,
    "message": "User not found"
}
```

---

#### 4. Update User

**PATCH** `/api/users/:user_id`

**Request Body (all fields optional):**

```json
{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "primaryMobile": "9876543210",
    "currentAddress": "456 New Street, Mumbai"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "User updated successfully"
}
```

**Note:** Aadhar and PAN cannot be updated (returns 400 error if attempted).

---

#### 5. Delete User (Soft Delete)

**DELETE** `/api/users/:user_id`

**Success Response (200):**

```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

**Error Response (404):**

```json
{
    "success": false,
    "message": "User not found"
}
```

---

### Rate Limits

- **General API calls**: 100 requests per 15 minutes per IP
- **User creation**: 10 requests per 15 minutes per IP

When rate limit is exceeded:

```json
{
    "success": false,
    "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

- **14 test cases** covering:
    - User creation (success, validation, duplicates)
    - User updates (success, validation, business rules)
    - User retrieval (pagination, single user)
    - User deletion (soft delete)

### Example Test Output

```
PASS  src/tests/user.test.ts
  User API - Create User
    ✓ should create a new user successfully (66 ms)
    ✓ should return 400 when required fields are missing (14 ms)
    ✓ should return 400 for invalid email format (7 ms)
    ✓ should return 400 for duplicate email or mobile (33 ms)
  ...

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

## Project Structure

```
Open_hearing_assignment/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   └── cors.config.ts          # CORS configuration
│   ├── middlewares/
│   │   ├── globalErrorHandler.ts  # Global error handling
│   │   └── rateLimiter.ts          # Rate limiting config
│   ├── modules/
│   │   └── user/
│   │       ├── user.routes.ts      # User routes
│   │       ├── user.controller.ts  # Request handlers
│   │       ├── user.service.ts     # Business logic
│   │       ├── user.validation.ts  # Input validation
│   │       ├── user.types.ts       # Type definitions
│   │       └── user.response.ts    # DTO transformations
│   ├── prisma/
│   │   └── client.ts               # Prisma client instance
│   ├── utils/
│   │   └── encryption.ts           # Encryption utilities
│   └── tests/
│       └── user.test.ts            # User API tests
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup file
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── LEARNINGS.md                    # Pain points & learnings
└── README.md                       # This file
```

## Security Features

### 1. Input Validation

- Zod schemas validate all user inputs
- Type-safe validation with detailed error messages
- Prevents injection attacks

### 2. Data Encryption

- **AES-256-GCM** encryption for sensitive data (Aadhar, PAN)
- **SHA-256** hashing for duplicate detection
- Encryption keys stored securely in environment variables

### 3. Rate Limiting

- IP-based rate limiting prevents brute force attacks
- Stricter limits on user creation endpoints
- Configurable limits per endpoint

### 4. CORS Protection

- Whitelist-based origin validation
- Environment-specific allowed origins
- Prevents unauthorized cross-origin requests

### 5. Soft Delete

- User data never truly deleted
- Maintains audit trail
- Compliance-friendly approach

### 6. SQL Injection Prevention

- Prisma ORM prevents SQL injection
- Parameterized queries
- Type-safe database operations

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**

1. Ensure PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -l`

---

### Issue 2: Encryption Key Error

**Error:** `The first argument must be of type string or an instance of Buffer`

**Solution:**

1. Generate a new encryption key (see [Environment Variables](#-environment-variables))
2. Ensure ENCRYPTION_KEY is 64 hexadecimal characters
3. No spaces or special characters in the key

---

### Issue 3: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8000`

**Solution:**

1. Kill process on port 8000: `lsof -ti:8000 | xargs kill -9`
2. Or change PORT in `.env`

---

### Issue 4: Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
npx prisma generate
```

## Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot reload |
| `npm run build`      | Compile TypeScript to JavaScript         |
| `npm start`          | Start production server                  |
| `npm test`           | Run all tests                            |
| `npm run test:watch` | Run tests in watch mode                  |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of an assignment submission.

## Author

**Ashrithiiitdm**

- GitHub: [@Ashrithiiitdm](https://github.com/Ashrithiiitdm)

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**Note**: For detailed explanations of architectural decisions, pain points, and learnings, see [LEARNINGS.md](./LEARNINGS.md)
