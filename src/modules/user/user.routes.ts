import { Router } from "express";
import {
    createUserController,
    getUsersController,
    updateUserController,
    getUserByIdController,
    deleteUserController,
} from "./user.controller.js";

const userRouter = Router();

userRouter.post("/users", createUserController);
userRouter.get("/users", getUsersController);
userRouter.get("/users/:user_id", getUserByIdController);
userRouter.patch("/users/:user_id", updateUserController);
userRouter.delete("/users/:user_id", deleteUserController);

export default userRouter;
