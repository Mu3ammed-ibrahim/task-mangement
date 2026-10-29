import { Router } from "express";
import { getTasksController, getTaskController, postTaskController,patchTaskController ,updateTaskController , deleteTaskController} from "./task.controller.js";
import { authHeader } from "../middleware/authHeader.js";
import { validateTask, validateTaskId } from "../middleware/validateTask.js";

export const router = Router() ;


router.get("/",authHeader, getTasksController)
router.get("/:id",authHeader,validateTaskId,getTaskController)
router.post("/",authHeader,validateTask,postTaskController)
router.put("/:id",authHeader,validateTaskId,validateTask,updateTaskController)
router.patch("/:id",authHeader,validateTaskId,validateTask,patchTaskController)
router.delete("/:id",authHeader,validateTaskId,deleteTaskController)