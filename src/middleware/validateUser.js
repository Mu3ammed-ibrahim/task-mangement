export const validateUser = (req, res, next) => {
    const { name, email } = req.body;

    if (
        !name ||
        !email ||
        !name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            message: "bad request"
        });
    }

    next();
};