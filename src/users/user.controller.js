import { createUser, getUsers, getUser, deleteUser, updateUser, getUserByEmail } from "./user.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const getUsersController = async (req,res, next)=>{
    try {
    const users = await getUsers();
    res.status(200).json(users)
        
    } catch (error) {
        return next(error)
    }

}
export const getUserByIdController = async(req,res,next)=>{
    try {
    const { id } = req.params;
    const user = await getUser(id);

    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json(user)
        
    } catch (error) {
        return next(error)
        
    }
}
export const createUserController = async(req,res,next)=>{
    try{
        const {name,email,password} = req.body;
        const newUser = await createUser(name,email,password)
        return res.status(201).json(newUser)
    }
    catch(error){
        return next(error)
    }
}
export const updateUserController = async(req,res,next)=>{
    try{
        const {id} = req.params;
        if (String(req.user.userId) !== String(id)) {
            return res.status(403).json({ message: "you can only update your own account" });
        }

        const{name,email} = req.body;
        const updateUserById = await updateUser(id , name , email)
        if(!updateUserById){
            return res.status(404).json({message : "user not found"})
        } res.status(200).json({message : "user is updated"})
    } catch(error){
        return next(error) 
    }
}

export const deleteUserController = async(req,res,next)=>{
    try{
        const {id} = req.params;
        if (String(req.user.userId) !== String(id)) {
            return res.status(403).json({ message: "you can only delete your own account" });
        }

        const deleteUserById =await deleteUser(id);
        if(deleteUserById === 0){
            return res.status(404).json({ message : 'user is not found'})
        }
        return res.status(204).send()
    }
    catch(error){
        return next(error)
    }
}
export const loginUserController = async (req, res, next) => {
    try {
        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";
        const password = typeof req.body.password === "string"
            ? req.body.password
            : "";

        const loginUser = await getUserByEmail(email);

        if (!loginUser) {
            return res.status(401).json({
                message: "invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            loginUser.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: loginUser.id, role: loginUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "login successful",
            token
        });

    } catch (error) {
        return next(error);
    }
};
