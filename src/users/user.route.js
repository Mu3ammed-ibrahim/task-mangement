import {Router } from "express";
import {getUsersController , getUserByIdController ,createUserController , loginUserController ,deleteUserController ,updateUserController } from "./user.controller.js"
import { validateRegister } from "../middleware/validateRegister.js";
import { validateUser } from "../middleware/validateUser.js";
import { authHeader } from "../middleware/authHeader.js";

export const router = Router()

router.get("/", authHeader, getUsersController)
router.get("/:id", authHeader, getUserByIdController)
router.delete("/:id", authHeader, deleteUserController)
router.post("/register", validateRegister, createUserController)
router.post("/login", loginUserController)
router.put("/:id", authHeader, validateUser, updateUserController)
