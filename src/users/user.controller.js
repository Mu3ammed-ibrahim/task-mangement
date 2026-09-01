import { createUser, getUsers , deleteUser, updateUser } from "./user.service.js";


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
     const {id} = req.params ; 
    const userId = await getUser(id)
    res.status(200).json(userId)
        
    } catch (error) {
        return next(error)
        
    }
}
export const createUserController = async(req,res,next)=>{
    try{
        const {name,email} = req.body;
        const newUser = await createUser(name,email)
        return res.status(201).json(newUser)
    }
    catch(error){
        return next(error)
    }
}
export const updateUserController = async(req,res,next)=>{
    try{
        
        const {id} = req.params;
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
