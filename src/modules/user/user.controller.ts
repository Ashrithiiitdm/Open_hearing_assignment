import type { Request, Response, NextFunction } from "express";
import { createUserSchema, updateUserSchema } from "./user.validation.js";
import { createUser, updateUser } from "./user.service.js";
type UpdateUserParams = {
    user_id: string;
};

export const createUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = createUserSchema.parse(req.body);

        const user = await createUser(validatedData);

        if (!user) {
            return res.status(500).json({
                message: "Failed to create user",
            });
        }

        return res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (err) {
        console.log("Error in createUserController:", err);
        next(err);
    }
};

export const updateUserController = async (
    req: Request<UpdateUserParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = req.params.user_id;

        const validatedData = updateUserSchema.parse(req.body);

        const updatedUser = await updateUser(user_id, validatedData);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found or could not be updated",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
        });
    } catch (err) {
        console.log("Error in updateUserController:", err);
        next(err);
    }
};
