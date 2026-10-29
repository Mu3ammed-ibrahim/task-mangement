import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { app } from "../app.js";
import { pool } from "../config/database.js";
import {
    assertTestDatabase,
    cleanupTestUsers,
    createTestUser,
    loginTestUser,
    registerTestUser,
    testPassword
} from "../test/testUtils.js";

const testEmails = new Set();
let testDatabaseVerified = false;

beforeAll(async () => {
    await assertTestDatabase();
    testDatabaseVerified = true;
});

afterEach(async () => {
    if (testDatabaseVerified && testEmails.size > 0) {
        await cleanupTestUsers([...testEmails]);
        testEmails.clear();
    }
});

afterAll(async () => {
    try {
        if (testDatabaseVerified && testEmails.size > 0) {
            await cleanupTestUsers([...testEmails]);
            testEmails.clear();
        }
    } finally {
        await pool.end();
    }
});

describe("User registration", () => {
    it("registers a user and stores a bcrypt password hash", async () => {
        const { user, response } = await registerTestUser(request(app), testEmails);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            user_email: user.email,
            role: "user"
        });
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).not.toHaveProperty("password");
        expect(response.body).not.toHaveProperty("password_hash");

        const result = await pool.query(
            "SELECT password FROM users WHERE email = $1",
            [user.email]
        );
        expect(result.rowCount).toBe(1);
        expect(result.rows[0].password).not.toBe(user.password);
        expect(await bcrypt.compare(user.password, result.rows[0].password)).toBe(true);
    });

    it("returns 409 when the same email is registered twice", async () => {
        const user = createTestUser();
        const first = await registerTestUser(request(app), testEmails, user);
        const duplicate = await request(app).post("/users/register").send(user);

        expect(first.response.status).toBe(201);
        expect(duplicate.status).toBe(409);
    });

    it.each([
        ["an empty body", {}],
        ["a missing name", { email: "someone@example.test", password: testPassword }],
        ["an empty email", { name: "Test User", email: " ", password: testPassword }],
        ["a non-string password", { name: "Test User", email: "someone@example.test", password: 12345678 }],
        ["a short password", { name: "Test User", email: "someone@example.test", password: "short" }]
    ])("returns 400 for %s", async (_description, body) => {
        const response = await request(app).post("/users/register").send(body);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });
});

describe("User login", () => {
    it("logs in its own registered user and returns a verifiable token", async () => {
        const { user, response: registration } = await registerTestUser(request(app), testEmails);
        const response = await loginTestUser(request(app), user);

        expect(registration.status).toBe(201);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).not.toHaveProperty("password");
        expect(response.body).not.toHaveProperty("password_hash");
        expect(jwt.verify(response.body.token, process.env.JWT_SECRET)).toMatchObject({
            userId: registration.body.user_id
        });
    });

    it("rejects an incorrect password", async () => {
        const { user } = await registerTestUser(request(app), testEmails);
        const response = await request(app)
            .post("/users/login")
            .send({ email: user.email, password: `${user.password}-wrong` });

        expect(response.status).toBe(401);
    });

    it("rejects an unknown email", async () => {
        const response = await request(app)
            .post("/users/login")
            .send({ email: `unknown-${createTestUser().email}`, password: testPassword });

        expect(response.status).toBe(401);
    });

    it.each([
        ["an empty body", {}],
        ["a missing password", { email: "someone@example.test" }],
        ["a non-string email", { email: 123, password: testPassword }]
    ])("rejects login with %s", async (_description, body) => {
        const response = await request(app).post("/users/login").send(body);

        expect(response.status).toBe(401);
    });
});
