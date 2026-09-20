import {Router } from "express";
import {getUsersController , getUserByIdController ,createUserController , loginUserController ,deleteUserController ,updateUserController } from "./user.controller.js"
import { validateRegister } from "../middleware/validateRegister.js";
export const router = Router()
router.get("/" , getUsersController)
router.get("/:id" , getUserByIdController)
router.delete("/:id" ,deleteUserController )
router.post("/register",validateRegister,createUserController)
router.post("/login",loginUserController)
// router.put("/:id",validateUser ,updateUserController)