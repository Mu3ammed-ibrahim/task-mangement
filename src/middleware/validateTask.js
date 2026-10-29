const taskStatuses = new Set(["pending", "in_progress", "completed"]);
const taskPriorities = new Set(["low", "medium", "high"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) => {
    if (typeof value !== "string" || !datePattern.test(value)) {
        return false;
    }

    const parsedDate = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === value;
};

export const validateTaskId = (req, res, next) => {
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(req.params.id)) {
        return res.status(400).json({ message: "invalid task id" });
    }

    return next();
};

export const validateTask = (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ message: "task fields are required" });
    }

    const requiredFields = req.method === "PUT"
        ? ["title", "status", "priority"]
        : req.method === "POST"
            ? ["title"]
            : [];
    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === "") {
            return res.status(400).json({ message: `${field} is required` });
        }
    }

    if (body.title !== undefined &&
        (typeof body.title !== "string" || !body.title.trim())) {
        return res.status(400).json({ message: "title must be a non-empty string" });
    }
    if (body.description !== undefined &&
        body.description !== null &&
        typeof body.description !== "string") {
        return res.status(400).json({ message: "description must be a string or null" });
    }
    if (body.status !== undefined && !taskStatuses.has(body.status)) {
        return res.status(400).json({ message: "invalid task status" });
    }
    if (body.priority !== undefined && !taskPriorities.has(body.priority)) {
        return res.status(400).json({ message: "invalid task priority" });
    }
    if (body.due_date !== undefined &&
        body.due_date !== null &&
        !isValidDate(body.due_date)) {
        return res.status(400).json({ message: "due_date must be a valid YYYY-MM-DD date or null" });
    }

    if (body.title !== undefined) {
        body.title = body.title.trim();
    }
    return next();
};
