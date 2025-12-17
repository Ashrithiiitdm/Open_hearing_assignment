import { z } from "zod";

export const createUserSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters long" }),

        email: z.string().email({ message: "Invalid email address" }),

        primaryMobile: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid mobile number" }),

        secondaryMobile: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid mobile number" })
            .nullable()
            .default(null),

        aadhar: z
            .string()
            .length(12, { message: "Aadhar must be 12 digits long" }),

        pan: z
            .string()
            .length(10, { message: "PAN must be 10 characters long" }),

        currentAddress: z
            .string()
            .min(5, { message: "Current address is too short" }),

        permanentAddress: z
            .string()
            .min(5, { message: "Permanent address is too short" }),

        dateOfBirth: z.coerce.date(),
        placeOfBirth: z.string(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Request body cannot be empty",
    });

export const updateUserSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .optional(),

        email: z
            .string()
            .min(1, { message: "Email cannot be empty" })
            .email({ message: "Invalid email address" })
            .optional(),

        primaryMobile: z
            .string()
            .min(1, { message: "Primary mobile cannot be empty" })
            .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid mobile number" })
            .optional(),

        secondaryMobile: z
            .string()
            .min(1, { message: "Secondary mobile cannot be empty" })
            .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid mobile number" })
            .nullable()
            .optional(),

        aadhar: z
            .string()
            .length(12, { message: "Aadhar must be 12 digits long" })
            .optional(),

        pan: z
            .string()
            .length(10, { message: "PAN must be 10 characters long" })
            .optional(),

        currentAddress: z
            .string()
            .min(5, { message: "Current address is too short" })
            .optional(),

        permanentAddress: z
            .string()
            .min(5, { message: "Permanent address is too short" })
            .optional(),

        dateOfBirth: z.coerce.date().optional(),

        placeOfBirth: z
            .string()
            .min(1, { message: "Place of birth cannot be empty" })
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });
