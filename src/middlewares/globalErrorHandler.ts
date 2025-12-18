import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import type { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Zod validation error
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    // Custom error messages for duplicate checks
    if (err instanceof Error) {
        if (
            err.message === "Email already exists" ||
            err.message === "Primary mobile number already exists" ||
            err.message === "Aadhar number already exists" ||
            err.message === "PAN number already exists"
        ) {
            return res.status(409).json({
                success: false,
                message: err.message,
            });
        }
    }

    // Prisma unique constraint
    if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
    ) {
        return res.status(409).json({
            success: false,
            message: "Duplicate value violates unique constraint",
            fields: err.meta?.target,
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
