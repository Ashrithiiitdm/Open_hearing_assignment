import { Router } from "express";
import {
    createUserController,
    getUsersController,
    updateUserController,
    getUserByIdController,
    deleteUserController,
} from "./user.controller.js";
import { createAccountLimiter } from "../../middlewares/rateLimiter.js";

const userRouter = Router();

// Apply stricter rate limiting to user creation
userRouter.post("/users", createAccountLimiter, createUserController);
userRouter.get("/users", getUsersController);
userRouter.get("/users/:user_id", getUserByIdController);
userRouter.patch("/users/:user_id", updateUserController);
userRouter.delete("/users/:user_id", deleteUserController);

export default userRouter;
