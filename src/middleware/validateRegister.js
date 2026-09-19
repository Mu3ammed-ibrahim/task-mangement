export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "name, email and password are required"
        });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
        return res.status(400).json({
            message: "name and email cannot be empty"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "password must be at least 8 characters"
        });
    }

    req.body.name = normalizedName;
    req.body.email = normalizedEmail;

    next();
};