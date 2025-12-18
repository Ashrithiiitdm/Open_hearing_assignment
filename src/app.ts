import express from "express";
import cors from "cors";
import userRouter from "./modules/user/user.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { corsOptions } from "./config/cors.config.js";

const app = express();

// Security Middlewares
app.use(cors(corsOptions)); // CORS configuration

// Body Parser
app.use(express.json({ limit: "10mb" })); // Limit payload size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting
app.use("/api", apiLimiter); // Apply rate limiting to all API routes

// Health Check Endpoint (no rate limiting)
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api", userRouter);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;
