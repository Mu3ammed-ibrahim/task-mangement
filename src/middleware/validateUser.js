export const validateUser = (req, res, next) => {
    const { name, email } = req.body;

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        !name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            message: "name and email are required"
        });
    }

    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    next();
};
