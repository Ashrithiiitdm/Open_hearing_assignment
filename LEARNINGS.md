# User Management API - Technical Documentation

## Project Overview
A production-ready REST API for user management built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** with **Prisma ORM**. This API provides secure user CRUD operations with comprehensive validation, encryption, and rate limiting.

---

## Pain Points & Learnings

### Pain Points Encountered

#### 1. **Sensitive Data Encryption vs. Duplicate Detection**
**Problem**: We needed to encrypt Aadhar and PAN for security, but encrypted values are different each time, making duplicate detection impossible.

**Solution**: 
- Store both encrypted values (for security) and hash values (for duplicate detection)
- Use `encrypt()` for data we need to retrieve (Aadhar, PAN)
- Use `hash()` for duplicate checking (unique constraint on hash columns)

**Learning**: Sometimes you need to store data in multiple formats for different purposes. Security and functionality requirements can conflict, requiring creative solutions.

```typescript
// Bad: Can't detect duplicates
aadhar: encrypt(newUser.aadhar)

// Good: Can detect duplicates AND keep data secure
aadhar: encrypt(newUser.aadhar),      // For retrieval
aadharHash: hash(newUser.aadhar)      // For duplicate detection
```

---

#### 2. **TypeScript Module Resolution with .js Extensions**
**Problem**: TypeScript files use `.ts` extension but at runtime, imports need `.js` extension. This was confusing initially.

**Solution**: Always use `.js` extensions in import statements, even in `.ts` files:
```typescript
import prisma from "./prisma/client.js";  // Correct
import prisma from "./prisma/client";     //  Wrong
```

**Learning**: TypeScript's module resolution for ES modules requires `.js` extensions in imports because that's what the compiled JavaScript will use.

---

#### 3. **Test Environment Setup**
**Problem**: Tests were failing because environment variables weren't loaded before modules that depend on them (encryption utility).

**Solution**: 
- Created `jest.setup.js` to load env variables FIRST
- Configured Jest to run setup file before any test files
- Separated test environment (`.env.test`) from development (`.env`)

**Learning**: Order matters! Environment variables must be loaded before any code that uses `process.env` is imported.

---

#### 4. **Rate Limiting Strategy**
**Problem**: How to prevent abuse without blocking legitimate users?

**Solution**: Implemented two-tier rate limiting:
- General API: 100 requests per 15 minutes
- User creation: 10 requests per 15 minutes (stricter)

**Learning**: Different operations require different limits. Sensitive operations (create accounts) need stricter protection than read operations.

---

#### 5. **Validation Error Handling**
**Problem**: Zod validation errors return complex nested structures that aren't user-friendly.

**Solution**: Global error handler transforms Zod errors into clean, readable format:
```typescript
// Raw Zod error: Complex nested structure
// Transformed: { field: "email", message: "Invalid email address" }
```

**Learning**: Never expose raw error objects to users. Always transform them into a consistent, user-friendly format.

---

#### 6. **Soft Delete Implementation**
**Problem**: How to "delete" users without actually removing data (for compliance/audit)?

**Solution**: 
- Added `deletedAt` and `isActive` fields
- Delete operation sets `deletedAt: new Date()` and `isActive: false`
- All queries filter `WHERE deletedAt IS NULL`

**Learning**: Soft deletes are crucial for audit trails and data recovery. Always filter by `deletedAt` in all queries.

---

#### 7. **Testing Database State Management**
**Problem**: Tests interfering with each other due to shared database state.

**Solution**:
- `beforeAll()`: Clean database before test suite
- `afterAll()`: Clean up and disconnect after tests
- Each test suite creates its own isolated test data

**Learning**: Test isolation is critical. Always clean up before and after tests.

---

## Best Practices Implemented

### 1. **Security Best Practices**

#### a) Input Validation
- Zod schema validation for all inputs
- Type-safe validation with TypeScript integration
- Custom error messages for better UX

#### b) Data Encryption
- AES-256-GCM encryption for sensitive data (Aadhar, PAN)
- SHA-256 hashing for duplicate detection
- Encryption key stored in environment variables

#### c) Rate Limiting
- IP-based rate limiting to prevent abuse
- Stricter limits for sensitive operations
- Proper error messages when limit exceeded

#### d) CORS Configuration
- Whitelist-based origin validation
- Environment-specific allowed origins
- Credentials support for authenticated requests

---

### 2. **Code Organization Best Practices**

#### a) Layered Architecture
```
Routes → Controllers → Services → Database
```
- **Routes**: Define endpoints and apply middleware
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and database operations
- **Validation**: Input validation schemas

**Why?** Separation of concerns makes code testable, maintainable, and scalable.

#### b) Modular Structure
```
src/
  ├── modules/user/          # User feature module
  │   ├── user.routes.ts     # HTTP routes
  │   ├── user.controller.ts # Request handlers
  │   ├── user.service.ts    # Business logic
  │   ├── user.validation.ts # Input validation
  │   ├── user.types.ts      # Type definitions
  │   └── user.response.ts   # DTO transformations
  ├── middlewares/           # Shared middleware
  ├── utils/                 # Utility functions
  └── config/                # Configuration files
```

**Why?** Feature-based modules make it easy to find related code and scale the application.

---

### 3. **Database Best Practices**

#### a) Prisma ORM
- Type-safe database queries
- Migration-based schema management
- Automatic relation handling

#### b) Indexing Strategy
```typescript
@@index([email])
@@index([id])
@@index([primaryMobile])
```
**Why?** Indexes on frequently queried fields dramatically improve query performance.

#### c) Unique Constraints
- Email, primary mobile, Aadhar hash, PAN hash all unique
- Prevents duplicate users at database level

---

### 4. **API Design Best Practices**

#### a) Consistent Response Format
```typescript
// Success
{
  success: true,
  message: "User created successfully",
  data: { ... }
}

// Error
{
  success: false,
  message: "Validation failed",
  errors: [ ... ]
}
```

#### b) Proper HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error
- `404`: Not found
- `409`: Conflict (duplicate)
- `500`: Server error

#### c) Pagination Implementation
```typescript
GET /api/users?page=1&limit=10

Response:
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5
  }
}
```

**Why?** Prevents loading all records, improves performance.

---

### 5. **Testing Best Practices**

#### a) Comprehensive Test Coverage
- 14 test cases covering all endpoints
- Success scenarios
- Error scenarios
- Validation tests
- Business rule tests (can't update Aadhar/PAN)

#### b) AAA Pattern (Arrange-Act-Assert)
```typescript
test('should create user', async () => {
  // Arrange: Set up test data
  const user = { name: "Test", ... };
  
  // Act: Perform the action
  const response = await request(app).post('/api/users').send(user);
  
  // Assert: Verify the result
  expect(response.status).toBe(201);
});
```

#### c) Test Isolation
- Each test suite has its own setup/teardown
- Database cleaned before/after tests
- No test dependencies on each other

---

### 6. **TypeScript Best Practices**

#### a) Strict Type Safety
```typescript
//  Good: Explicit types
export const createUser = async (newUser: CreateUserInput): Promise<User> => {
  ...
}

// Bad: Implicit any
export const createUser = async (newUser) => {
  ...
}
```

#### b) Type Inference from Zod
```typescript
export type CreateUserInput = z.infer<typeof createUserSchema>;
```
**Why?** Single source of truth for validation and types.

#### c) Discriminated Unions
```typescript
type ApiResponse = 
  | { success: true; data: User }
  | { success: false; message: string };
```

---

### 7. **Error Handling Best Practices**

#### a) Global Error Handler
- Centralized error handling
- Transforms technical errors into user-friendly messages
- Logs errors for debugging
- Never exposes sensitive information

#### b) Custom Error Messages
```typescript
if (existingEmail) {
  throw new Error("Email already exists");
}
```
**Why?** Clear, actionable error messages improve developer and user experience.

---

### 8. **Environment Management**

#### a) Environment Variables
```
.env           # Development
.env.test      # Testing
.env.example   # Template (committed to Git)
```

#### b) Never Commit Secrets
- `.env` in `.gitignore`
- `.env.example` with placeholders
- Documentation for setting up environment

---

## Architecture Decisions

### Why PostgreSQL?
- ACID compliance for financial data (Aadhar, PAN)
- Strong typing
- Excellent Prisma support
- Production-ready with good performance

### Why Prisma ORM?
- Type-safe queries
- Auto-generated TypeScript types
- Migration system
- Better developer experience than raw SQL

### Why Zod for Validation?
- TypeScript-first
- Runtime validation
- Type inference
- Composable schemas

### Why Express?
- Mature ecosystem
- Middleware support
- Simple to understand
- Production-proven

---

## Security Considerations

### Implemented:
1. Input validation (Zod)
2. Rate limiting (express-rate-limit)
3. CORS protection
4. Encryption of sensitive data
5. SQL injection prevention (Prisma)
6. Environment variable protection

### Future Enhancements:
1. JWT authentication
2. Role-based access control (RBAC)
3. API key authentication
4. Request logging/audit trail
5. Helmet.js for additional headers
6. Input sanitization

---

## Performance Optimizations

### Implemented:
1. Database indexing on frequently queried fields
2. Pagination to limit data transfer
3. Promise.all for parallel database queries
4. Connection pooling (Prisma default)

### Future Enhancements:
1. Redis caching for frequently accessed data
2. Database query optimization
3. Compression middleware

---



## Key Takeaways

1. **Security First**: Always validate, sanitize, and encrypt. Never trust user input.

2. **Fail Fast**: Validate early, return errors immediately. Don't process invalid data.

3. **Separate Concerns**: Keep routes, controllers, and services separate. Each has one responsibility.

4. **Test Everything**: Write tests as you code, not after. Tests are documentation.

5. **Type Safety**: TypeScript catches bugs at compile time. Use it strictly.

6. **Document Decisions**: Every architectural decision should have a "why".

7. **Refactor Continuously**: Don't wait for "perfect" code. Iterate and improve.

8. **Learn from Errors**: Every error is a learning opportunity. Document what you learned.

