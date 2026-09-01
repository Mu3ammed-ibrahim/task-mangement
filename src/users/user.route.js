import {Router } from "express";
import {getUsersController , getUserByIdController ,createUserController ,deleteUserController ,updateUserController } from "./user.controller.js"
import { validateUser} from "../middleware/validateUser.js";
export const router = Router()
router.get("/" , getUsersController)
router.get("/:id" , getUserByIdController)
router.delete("/:id" ,deleteUserController )
router.post("/",validateUser,createUserController)
router.put("/:id",validateUser ,updateUserController)