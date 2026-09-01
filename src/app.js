import express from "express";
import { router as userRouter } from "./users/user.route.js";
import{router as taskRouter} from "./tasks/task.route.js"
import { errorHandler } from "./middleware/errorHandler.js";
export const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use("/tasks" , taskRouter)
app.use(errorHandler)