import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { app } from "../app.js";
import { pool } from "../config/database.js";
import {
  assertTestDatabase,
  cleanupTestUsers,
  createTestUser,
  loginTestUser,
  registerTestUser
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

const registerAndLogin = async () => {
  const { user, response: registration } = await registerTestUser(request(app), testEmails);
  expect(registration.status).toBe(201);
  const login = await loginTestUser(request(app), user);
  expect(login.status).toBe(200);
  return { user, userId: registration.body.user_id, token: login.body.token };
};

const taskInput = (overrides = {}) => ({
  title: "Test task",
  description: "Created by the API test suite",
  status: "pending",
  priority: "medium",
  due_date: "2030-01-15",
  ...overrides
});

const createTask = async (token, input = taskInput()) =>
  request(app).post("/tasks").set("Authorization", `Bearer ${token}`).send(input);

describe("Tasks API Authentication", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(401);
  });

  it.each([
    ["malformed authorization format", "not-a-bearer-token"],
    ["invalid token", "Bearer invalid.token.value"],
    ["expired token", `Bearer ${jwt.sign({ userId: randomUUID() }, process.env.JWT_SECRET, { expiresIn: "-1s" })}`]
  ])("returns 401 for %s", async (_description, authorization) => {
    const response = await request(app).get("/tasks").set("Authorization", authorization);

    expect(response.status).toBe(401);
  });

  it("accepts a valid token", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tasks");
  });
});

describe("Tasks API", () => {
  it("creates a task and returns its persisted representation", async () => {
    const { token, userId } = await registerAndLogin();
    const response = await createTask(token);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
        user_id: userId,
        title: "Test task",
        status: "pending",
        priority: "medium"
    });

    const result = await pool.query(
        "SELECT user_id, title FROM tasks WHERE id = $1",
        [response.body.id]
    );
    expect(result.rows).toEqual([{ user_id: userId, title: "Test task" }]);
  });

  it("retrieves only the authenticated user's tasks and retrieves one by ID", async () => {
    const owner = await registerAndLogin();
    const other = await registerAndLogin();
    const created = await createTask(owner.token);

    const ownTasks = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${owner.token}`);
    const otherTasks = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${other.token}`);
    const byId = await request(app)
        .get(`/tasks/${created.body.id}`)
        .set("Authorization", `Bearer ${owner.token}`);

    expect(ownTasks.status).toBe(200);
    expect(ownTasks.body.tasks.map((task) => task.task_id)).toContain(created.body.id);
    expect(otherTasks.status).toBe(200);
    expect(otherTasks.body.tasks).toEqual([]);
    expect(byId.status).toBe(200);
    expect(byId.body.user_id).toBe(owner.userId);
  });

  it("updates and partially updates a task owned by the authenticated user", async () => {
    const { token } = await registerAndLogin();
    const created = await createTask(token);
    const updated = await request(app)
        .put(`/tasks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(taskInput({
            title: "Updated task",
            status: "in_progress",
            priority: "high"
        }));
    const patched = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Updated description" });

    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({
        title: "Updated task",
        status: "in_progress",
        priority: "high"
    });
    expect(patched.status).toBe(200);
    expect(patched.body.description).toBe("Updated description");
  });

  it("deletes a task owned by the authenticated user", async () => {
    const { token } = await registerAndLogin();
    const created = await createTask(token);
    const deleted = await request(app)
        .delete(`/tasks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`);
    const fetched = await request(app)
        .get(`/tasks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(204);
    expect(fetched.status).toBe(404);
  });

  it("rejects a missing title, invalid status, and invalid priority", async () => {
    const { token } = await registerAndLogin();
    const missingTitle = await createTask(token, {
        description: "Title intentionally omitted",
        status: "pending",
        priority: "medium"
    });
    const invalidStatus = await createTask(token, taskInput({ status: "blocked" }));
    const invalidPriority = await createTask(token, taskInput({ priority: "urgent" }));
    const invalidDate = await createTask(token, taskInput({ due_date: "2030-02-31" }));
    const emptyPatch = await request(app)
        .patch(`/tasks/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

    expect(missingTitle.status).toBe(400);
    expect(invalidStatus.status).toBe(400);
    expect(invalidPriority.status).toBe(400);
    expect(invalidDate.status).toBe(400);
    expect(emptyPatch.status).toBe(400);
  });

  it("returns 400 for malformed task IDs and 404 for valid but nonexistent IDs", async () => {
    const { token } = await registerAndLogin();
    const malformed = await request(app)
        .get("/tasks/not-a-uuid")
        .set("Authorization", `Bearer ${token}`);
    const missing = await request(app)
        .get(`/tasks/${randomUUID()}`)
        .set("Authorization", `Bearer ${token}`);

    expect(malformed.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("returns 404 when updating or deleting a valid but nonexistent task ID", async () => {
    const { token } = await registerAndLogin();
    const missingId = randomUUID();
    const updated = await request(app)
        .put(`/tasks/${missingId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(taskInput());
    const patched = await request(app)
        .patch(`/tasks/${missingId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "No task to update" });
    const deleted = await request(app)
        .delete(`/tasks/${missingId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(updated.status).toBe(404);
    expect(patched.status).toBe(404);
    expect(deleted.status).toBe(404);
  });

  it("does not allow another user to read, update, patch, or delete a task", async () => {
    const owner = await registerAndLogin();
    const other = await registerAndLogin();
    const created = await createTask(owner.token);
    const taskId = created.body.id;
    const read = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${other.token}`);
    const updated = await request(app)
        .put(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${other.token}`)
        .send(taskInput({ title: "Unauthorized update" }));
    const patched = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${other.token}`)
        .send({ title: "Unauthorized patch" });
    const deleted = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${other.token}`);
    const ownership = await pool.query(
        "SELECT user_id, title FROM tasks WHERE id = $1",
        [taskId]
    );

    expect(read.status).toBe(404);
    expect(updated.status).toBe(404);
    expect(patched.status).toBe(404);
    expect(deleted.status).toBe(404);
    expect(ownership.rows).toEqual([{ user_id: owner.userId, title: "Test task" }]);
  });
});
