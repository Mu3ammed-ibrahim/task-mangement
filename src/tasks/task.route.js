import { Router } from "express";
import { getTasksController, getTaskController, postTaskController,patchTaskController ,updateTaskController , deleteTaskController} from "./task.controller.js";
import { authHeader } from "../middleware/authHeader.js";

export const router = Router() ;


router.get("/",authHeader, getTasksController)
router.get("/:id",authHeader,getTaskController)
router.post("/",authHeader,postTaskController)
router.put("/:id",authHeader,updateTaskController)
router.patch("/:id",authHeader,patchTaskController)
router.delete("/:id",authHeader,deleteTaskController)