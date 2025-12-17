import prisma from "../../prisma/client.js";
import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./user.validation.js";

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createUser = async (newUser: CreateUserInput) => {
    try {
        const user = await prisma.user.create({
            data: newUser,
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
