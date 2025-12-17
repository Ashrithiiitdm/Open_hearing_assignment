import type { Request, Response, NextFunction } from "express";
import { createUserSchema, updateUserSchema } from "./user.validation.js";
import { createUser, getUsers, updateUser, getUserById, deleteUser } from "./user.service.js";
import type { GetUsersResponse } from "./user.types.js";
import { toGetUserDTO, toGetUserDTOs } from "./user.response.js";

type UserIdParams = {
    user_id: string;
};

type GetUsersQuery = {
    page?: string;
    limit?: string;
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
    req: Request<UserIdParams>,
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

export const getUsersController = async (
    req: Request<{}, {}, {}, GetUsersQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await getUsers(page, limit);

        const users = result.data;
        const response: GetUsersResponse = {
            data: toGetUserDTOs(users),
            pagination: {
                total: result.pagination.totalUsers,
                page: result.pagination.page,
                limit: result.pagination.limit,
                totalPages: result.pagination.totalPages,
            },
        };

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: response,
        });
    } catch (err) {
        console.log("Error in getAllUsersController:", err);
        next(err);
    }
};

export const getUserByIdController = async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = req.params.user_id;

        const user = await getUserById(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: toGetUserDTO(user),
        });
    } catch (err) {
        console.log("Error in getUserByIdController:", err);
        next(err);
    }
};

export const deleteUserController = async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = req.params.user_id;

        const deletedUser = await deleteUser(user_id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found or already deleted",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        console.log("Error in deleteUserController:", err);
        next(err);
    }
};
