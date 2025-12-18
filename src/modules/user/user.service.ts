import prisma from "../../prisma/client.js";
import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./user.validation.js";
import { encrypt, hash } from "../../utils/encryption.js";

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createUser = async (newUser: CreateUserInput) => {
    try {
        // Check for existing email
        const existingEmail = await prisma.user.findUnique({
            where: { email: newUser.email },
        });
        if (existingEmail) {
            throw new Error("Email already exists");
        }

        // Check for existing primaryMobile
        const existingMobile = await prisma.user.findUnique({
            where: { primaryMobile: newUser.primaryMobile },
        });
        if (existingMobile) {
            throw new Error("Primary mobile number already exists");
        }

        // Create hashes for duplicate detection
        const aadharHash = hash(newUser.aadhar);
        const panHash = hash(newUser.pan);

        // Check for existing Aadhar hash
        const existingAadhar = await prisma.user.findUnique({
            where: { aadharHash },
        });
        if (existingAadhar) {
            throw new Error("Aadhar number already exists");
        }

        // Check for existing PAN hash
        const existingPan = await prisma.user.findUnique({
            where: { panHash },
        });
        if (existingPan) {
            throw new Error("PAN number already exists");
        }

        // Encrypt sensitive data
        const encryptedAadhar = encrypt(newUser.aadhar);
        const encryptedPan = encrypt(newUser.pan);

        const user = await prisma.user.create({
            data: {
                ...newUser,
                aadhar: encryptedAadhar,
                aadharHash,
                pan: encryptedPan,
                panHash,
            },
        });

        return user;
    } catch (err) {
        console.log("Error creating user:", err);
        throw err;
    }
};

export const updateUser = async (
    user_id: string,
    updatedData: UpdateUserInput
) => {
    if (Object.keys(updatedData).length === 0) {
        throw new Error("No data provided for update");
    }
    const cleanedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
    );

    try {
        const isUser = await prisma.user.findUnique({
            where: {
                id: user_id,
                deletedAt: null,
            },
        });

        if (!isUser) {
            return null;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user_id,
                deletedAt: null,
            },
            data: cleanedData,
        });

        return updatedUser;
    } catch (err) {
        console.log("Error updating user:", err);
        throw err;
    }
};

export const getUsers = async (page: number, limit: number) => {
    try {
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit > 50 ? 50 : limit;

        const skip = (safePage - 1) * safeLimit;

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where: {
                    deletedAt: null,
                },
                skip: skip,
                take: safeLimit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.user.count({
                where: {
                    deletedAt: null,
                },
            }),
        ]);

        return {
            data: users,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / safeLimit),
            },
        };
    } catch (err) {
        console.log("Error fetching users:", err);
        throw err;
    }
};

export const getUserById = async (user_id: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
                deletedAt: null,
            },
        });

        return user;
    } catch (err) {
        console.log("Error fetching user by ID:", err);
        throw err;
    }
};

export const deleteUser = async (user_id: string) => {
    try {
        const isPresent = await prisma.user.findUnique({
            where: {
                id: user_id,
                deletedAt: null,
            },
        });

        if (!isPresent) {
            return null;
        }

        const deletedUser = await prisma.user.update({
            where: {
                id: user_id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        return deletedUser;
    } catch (err) {
        console.log("Error deleting user:", err);
        throw err;
    }
};
