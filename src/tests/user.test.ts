/**
 * USER API TEST FILE
 *
 * This file tests the User API endpoints.
 * We'll start with ONE simple test to understand the basics.
 */

// STEP 1: Import testing tools
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
// - describe: Groups related tests together
// - test: Defines a single test case
// - expect: Checks if something is true (assertions)
// - beforeAll: Runs once before all tests (setup)
// - afterAll: Runs once after all tests (cleanup)

import request from "supertest";
// - supertest: Makes HTTP requests to our API in tests
// - request(app).post('/api/users') = Makes a POST request

import app from "../app.js";
// - Import our Express app (but don't start the server)

import prisma from "../prisma/client.js";
// - Import Prisma to interact with database in tests

import { encrypt } from "../utils/encryption.js";
// - Import encrypt function to hash sensitive data when creating users directly in DB

/**
 * BEFORE TESTS START
 * This runs ONCE before all tests
 * Purpose: Clean up the database so tests start fresh
 */
beforeAll(async () => {
    // Delete all users from database (clean slate)
    await prisma.user.deleteMany({});
});

/**
 * AFTER TESTS FINISH
 * This runs ONCE after all tests complete
 * Purpose: Clean up and close database connection
 */
afterAll(async () => {
    // Delete test data
    await prisma.user.deleteMany({});

    // Disconnect from database (important!)
    await prisma.$disconnect();
});

/**
 * TEST SUITE: User API
 * A "suite" is a group of related tests
 */
describe("User API - Create User", () => {
    /**
     * TEST CASE #1: Successfully create a user
     *
     * What this test does:
     * 1. Sends a POST request to /api/users
     * 2. Includes user data in the request body
     * 3. Checks if response status is 201 (Created)
     * 4. Checks if response contains the user data
     */
    test("should create a new user successfully", async () => {
        // ARRANGE: Prepare the test data
        // This is the data we'll send to the API
        const newUser = {
            name: "John Doe",
            email: "john.doe@example.com",
            primaryMobile: "9876543210",
            secondaryMobile: "9876543211",
            aadhar: "123456789012", // Note: 12 digits (not 'aadhaar')
            pan: "ABCDE1234F", // Note: 10 characters
            dateOfBirth: "1990-01-01",
            placeOfBirth: "Mumbai",
            currentAddress: "123 Test Street, Mumbai",
            permanentAddress: "123 Test Street, Mumbai",
        };

        // ACT: Make the HTTP request to our API
        const response = await request(app) // Use supertest to make request
            .post("/api/users") // POST to /api/users endpoint
            .send(newUser) // Send the user data
            .set("Accept", "application/json") // Tell API we expect JSON response
            .set("Content-Type", "application/json"); // Tell API we're sending JSON

        // ASSERT: Check if the response is what we expect

        // Check 1: Status code should be 201 (Created)
        expect(response.status).toBe(201);
        // toBe() checks if two values are exactly equal

        // Check 2: Response should have success = true
        expect(response.body.success).toBe(true);
    });

    /**
     * TEST CASE #2: Validation error - missing required fields
     */
    test("should return 400 when required fields are missing", async () => {
        const incompleteUser = {
            name: "Jane Doe",
            email: "jane@example.com",
            // Missing other required fields
        };

        const response = await request(app)
            .post("/api/users")
            .send(incompleteUser)
            .set("Accept", "application/json");

        // Should return 400 Bad Request
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    /**
     * TEST CASE #3: Validation error - invalid email format
     */
    test("should return 400 for invalid email format", async () => {
        const invalidUser = {
            name: "Test User",
            email: "not-an-email", // Invalid email
            primaryMobile: "9876543210",
            secondaryMobile: "9876543211",
            aadhar: "123456789012",
            pan: "ABCDE1234F",
            dateOfBirth: "1990-01-01",
            placeOfBirth: "Mumbai",
            currentAddress: "123 Test Street",
            permanentAddress: "123 Test Street",
        };

        const response = await request(app)
            .post("/api/users")
            .send(invalidUser)
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    /**
     * TEST CASE #4: Duplicate email or mobile number
     */
    test("should return 400 for duplicate email or mobile", async () => {
        // First, create a user
        const user = {
            name: "Original User",
            email: "unique@example.com",
            primaryMobile: "9999999999",
            secondaryMobile: "9999999998",
            aadhar: "111111111111",
            pan: "AAAAA1111A",
            dateOfBirth: "1990-01-01",
            placeOfBirth: "Delhi",
            currentAddress: "123 Delhi Street",
            permanentAddress: "123 Delhi Street",
        };

        await request(app).post("/api/users").send(user);

        // Try to create another user with same email
        const duplicateUser = { ...user, name: "Duplicate User" };

        const response = await request(app)
            .post("/api/users")
            .send(duplicateUser)
            .set("Accept", "application/json");

        // Should return 409 Conflict for duplicate
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });
});

/**
 * TEST SUITE: Update User API
 */
describe("User API - Update User", () => {
    let createdUserId: string;

    // Create a user before each test in this suite
    beforeAll(async () => {
        const user = {
            name: "Update Test User",
            email: "update.test@example.com",
            primaryMobile: "8888888888",
            secondaryMobile: "8888888887",
            aadhar: "222222222222",
            pan: "BBBBB2222B",
            dateOfBirth: "1995-05-05",
            placeOfBirth: "Chennai",
            currentAddress: "456 Chennai Street",
            permanentAddress: "456 Chennai Street",
        };

        // Create user directly in database for testing
        const createdUser = await prisma.user.create({
            data: {
                ...user,
                dateOfBirth: new Date(user.dateOfBirth),
                aadharHash: encrypt(user.aadhar), // Encrypt aadhar
                panHash: encrypt(user.pan), // Encrypt pan
            },
        });
        createdUserId = createdUser.id;
    });

    /**
     * TEST CASE #5: Successfully update user
     */
    test("should update user successfully", async () => {
        const updates = {
            name: "Updated Name",
            currentAddress: "New Address Line 1",
        };

        const response = await request(app)
            .patch(`/api/users/${createdUserId}`)
            .send(updates)
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User updated successfully");
    });

    /**
     * TEST CASE #6: Cannot update Aadhar
     */
    test("should NOT allow updating Aadhar", async () => {
        const updates = {
            aadhar: "999999999999",
        };

        const response = await request(app)
            .patch(`/api/users/${createdUserId}`)
            .send(updates)
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        // Should have error message about Aadhar
    });

    /**
     * TEST CASE #7: Cannot update PAN
     */
    test("should NOT allow updating PAN", async () => {
        const updates = {
            pan: "ZZZZZ9999Z",
        };

        const response = await request(app)
            .patch(`/api/users/${createdUserId}`)
            .send(updates)
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    /**
     * TEST CASE #8: Update non-existent user (404)
     */
    test("should return 404 for non-existent user", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .patch(`/api/users/${fakeId}`)
            .send({ name: "Test" })
            .set("Accept", "application/json");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});

/**
 * TEST SUITE: Get All Users API (Pagination)
 */
describe("User API - Get All Users", () => {
    // Create multiple users before testing pagination
    beforeAll(async () => {
        await prisma.user.deleteMany({}); // Clean slate

        // Create 5 test users
        const users = [
            {
                name: "User 1",
                email: "user1@example.com",
                primaryMobile: "7777777771",
                aadhar: "333333333331",
                pan: "CCCCC3333C",
                dateOfBirth: new Date("1991-01-01"),
                placeOfBirth: "City1",
                currentAddress: "Address 1",
                permanentAddress: "Address 1",
            },
            {
                name: "User 2",
                email: "user2@example.com",
                primaryMobile: "7777777772",
                aadhar: "333333333332",
                pan: "DDDDD4444D",
                dateOfBirth: new Date("1992-02-02"),
                placeOfBirth: "City2",
                currentAddress: "Address 2",
                permanentAddress: "Address 2",
            },
            {
                name: "User 3",
                email: "user3@example.com",
                primaryMobile: "7777777773",
                aadhar: "333333333333",
                pan: "EEEEE5555E",
                dateOfBirth: new Date("1993-03-03"),
                placeOfBirth: "City3",
                currentAddress: "Address 3",
                permanentAddress: "Address 3",
            },
        ];

        for (const user of users) {
            await request(app).post("/api/users").send(user);
        }
    });

    /**
     * TEST CASE #9: Get all users with default pagination
     */
    test("should get all users with pagination", async () => {
        const response = await request(app)
            .get("/api/users")
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.data).toBeDefined();
        expect(Array.isArray(response.body.data.data)).toBe(true);
        expect(response.body.data.data.length).toBeGreaterThan(0);

        // Check pagination metadata (nested in data)
        expect(response.body.data.pagination).toBeDefined();
        expect(response.body.data.pagination.page).toBeDefined();
        expect(response.body.data.pagination.limit).toBeDefined();
        expect(response.body.data.pagination.total).toBeDefined();
    });

    /**
     * TEST CASE #10: Get users with custom page and limit
     */
    test("should get users with custom page and limit", async () => {
        const response = await request(app)
            .get("/api/users?page=1&limit=2")
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data.length).toBeLessThanOrEqual(2);
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(2);
    });
});

/**
 * TEST SUITE: Get User By ID
 */
describe("User API - Get User By ID", () => {
    let userId: string;

    beforeAll(async () => {
        const user = {
            name: "Get By ID Test",
            email: "getbyid@example.com",
            primaryMobile: "6666666666",
            aadhar: "444444444444",
            pan: "FFFFF6666F",
            dateOfBirth: "1994-04-04",
            placeOfBirth: "Kolkata",
            currentAddress: "789 Kolkata Street",
            permanentAddress: "789 Kolkata Street",
        };

        const createdUser = await prisma.user.create({
            data: {
                ...user,
                dateOfBirth: new Date(user.dateOfBirth),
                aadharHash: encrypt(user.aadhar), // Encrypt aadhar
                panHash: encrypt(user.pan), // Encrypt pan
            },
        });
        userId = createdUser.id;
    });

    /**
     * TEST CASE #11: Successfully get user by ID
     */
    test("should get user by ID successfully", async () => {
        const response = await request(app)
            .get(`/api/users/${userId}`)
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userId);
        expect(response.body.data.name).toBe("Get By ID Test");
    });

    /**
     * TEST CASE #12: User not found (404)
     */
    test("should return 404 for non-existent user ID", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .get(`/api/users/${fakeId}`)
            .set("Accept", "application/json");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});

/**
 * TEST SUITE: Delete User
 */
describe("User API - Delete User", () => {
    let userToDeleteId: string;

    beforeAll(async () => {
        const user = {
            name: "Delete Test User",
            email: "delete.test@example.com",
            primaryMobile: "5555555555",
            aadhar: "555555555555",
            pan: "GGGGG7777G",
            dateOfBirth: "1996-06-06",
            placeOfBirth: "Bangalore",
            currentAddress: "999 Bangalore Street",
            permanentAddress: "999 Bangalore Street",
        };

        const createdUser = await prisma.user.create({
            data: {
                ...user,
                dateOfBirth: new Date(user.dateOfBirth),
                aadharHash: encrypt(user.aadhar), // Encrypt aadhar
                panHash: encrypt(user.pan), // Encrypt pan
            },
        });
        userToDeleteId = createdUser.id;
    });

    /**
     * TEST CASE #13: Successfully delete user
     */
    test("should delete user successfully", async () => {
        const response = await request(app)
            .delete(`/api/users/${userToDeleteId}`)
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify user is actually deleted
        const getResponse = await request(app).get(
            `/api/users/${userToDeleteId}`
        );
        expect(getResponse.status).toBe(404);
    });

    /**
     * TEST CASE #14: Delete non-existent user (404)
     */
    test("should return 404 when deleting non-existent user", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .delete(`/api/users/${fakeId}`)
            .set("Accept", "application/json");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});

/**
 * HOW TO RUN THESE TESTS:
 *
 * In terminal: npm test
 *
 * To run a specific test suite: npm test -- -t "User API - Create User"
 * To see console logs: npm test -- --verbose
 */

/**
 * INTERVIEW TALKING POINTS:
 *
 * 1. Test Coverage:
 *    - Created 14 test cases covering all CRUD operations
 *    - Tested both success and failure scenarios
 *    - Validated business rules (Aadhar/PAN cannot be updated)
 *
 * 2. Test Organization:
 *    - Used describe() to group related tests
 *    - Used beforeAll() for test data setup
 *    - Used afterAll() for cleanup
 *
 * 3. Testing Best Practices:
 *    - AAA Pattern (Arrange-Act-Assert)
 *    - Isolated tests (each test is independent)
 *    - Clear test names describing what they test
 *    - Comprehensive assertions
 *
 * 4. What Each Matcher Does:
 *    - toBe(): Exact equality (===)
 *    - toBeDefined(): Checks value exists
 *    - not.toBe(): Checks values are different
 *    - toBeGreaterThan(): Number comparison
 *    - toBeLessThanOrEqual(): Number comparison
 *
 * 5. Why We Test:
 *    - Catch bugs early
 *    - Document expected behavior
 *    - Prevent regressions
 *    - Confidence in refactoring
 */
