export const errorHandler = (error, req, res, next) => {
    console.error(error);
     if(error.code === "23505"){
            return res.status(409).json({message : "email already exists"})
        }
    return res.status(500).json({
        message : "internal server err"
    })
}