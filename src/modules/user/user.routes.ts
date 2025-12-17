import { Router } from "express";
import {
    createUserController,
    updateUserController,
} from "./user.controller.js";

const userRouter = Router();

userRouter.post("/users", createUserController);
userRouter.patch("/users/:user_id", updateUserController);

export default userRouter;
