export const errorHandler = (error, req, res, next) => {
    console.error(error);
     if(error.code === "23505"){
            return res.status(409).json({message : "email already exists"})
        }
        if(error.code === "23503"){
            return res.status(400).json({"message": "user_id does not reference an existing user"})
        }
    return res.status(500).json({
        message : "internal server err"
    })
}