import type { CorsOptions } from "cors";

// CORS configuration
export const corsOptions: CorsOptions = {
    // Allow requests from these origins
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) {
            return callback(null, true);
        }

        // Define allowed origins based on environment
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(",")
            : [
                  "http://localhost:3000",
                  "http://localhost:3001",
                  "http://localhost:5173", // Vite default
                  "http://localhost:4200", // Angular default
              ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },

    // Allow these HTTP methods
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    // Allow these headers
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],

    // Expose these headers to the client
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],

    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,

    // Cache preflight request results for 24 hours
    maxAge: 86400,

    // Enable preflight for all routes
    preflightContinue: false,

    // Provide a status code for successful OPTIONS requests
    optionsSuccessStatus: 204,
};
