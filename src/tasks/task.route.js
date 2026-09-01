import { Router } from "express";
import { getTasksController, getTaskController } from "./task.controller.js";

export const router = Router() ;


router.get("/",getTasksController)
router.get("/:id",getTaskController)