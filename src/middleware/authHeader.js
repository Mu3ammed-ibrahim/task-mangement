import jwt from "jsonwebtoken";

export const authHeader = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const parts = typeof authorization === "string"
        ? authorization.trim().split(/\s+/)
        : [];
    const [scheme, token] = parts;

    if (parts.length !== 2 || scheme.toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is not configured"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || typeof decoded !== "object" || decoded.userId === undefined) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
