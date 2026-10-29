import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

export const testPassword = "test-password-123";

export const createTestUser = () => ({
    name: "Test User",
    email: `test-${randomUUID()}@example.test`,
    password: testPassword
});

export const assertTestDatabase = async () => {
    const result = await pool.query("SELECT current_database() AS database_name");
    if (result.rows[0]?.database_name !== "task_management_test") {
        throw new Error("Tests must only run against task_management_test");
    }
};

export const cleanupTestUsers = async (emails) => {
    if (emails.length === 0) {
        return;
    }

    await pool.query(
        "DELETE FROM tasks WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))",
        [emails]
    );
    await pool.query("DELETE FROM users WHERE email = ANY($1::text[])", [emails]);
};

export const registerTestUser = async (request, emails, user = createTestUser()) => {
    emails.add(user.email);
    const response = await request.post("/users/register").send(user);

    return { user, response };
};

export const loginTestUser = async (request, user) => {
    const response = await request
        .post("/users/login")
        .send({ email: user.email, password: user.password });

    return response;
};
