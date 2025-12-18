import rateLimit from "express-rate-limit";

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for successful requests (only count errors)
    skipSuccessfulRequests: false,
});

// Stricter rate limiter for create operations - 10 requests per 15 minutes
export const createAccountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 create requests per windowMs
    message: {
        success: false,
        message: "Too many accounts created from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true, // Don't count failed requests
});

