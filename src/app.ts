import express from "express";
import userRouter from "./modules/user/user.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

const app = express();

app.use(express.json());

app.use("/api", userRouter);
app.use(globalErrorHandler);

export default app;
