import { Router } from "express";
import { getTasksController, getTaskController, postTaskController,patchTaskController ,updateTaskController , deleteTaskController} from "./task.controller.js";

export const router = Router() ;


router.get("/",getTasksController)
router.get("/:id",getTaskController)
router.post("/",postTaskController)
router.put("/:id",updateTaskController)
router.patch("/:id",patchTaskController)
router.delete("/:id",deleteTaskController)