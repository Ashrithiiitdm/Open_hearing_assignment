/**
 * JEST SETUP FILE
 * This runs BEFORE any test files are loaded
 * Purpose: Load environment variables early
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Verify critical environment variables are loaded
if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not found in environment variables');
}

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in environment variables');
}
