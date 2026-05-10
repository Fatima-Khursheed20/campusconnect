/**
 * Smoke tests — no DB required for /api/health.
 * Load app without starting HTTP server (see server.js require.main guard).
 */
const request = require("supertest");

describe("API smoke", () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "jest-jwt-secret-min-32-characters!!";
    process.env.NODE_ENV = "test";
    jest.resetModules();
    app = require("../server");
  });

  test("GET / returns OK", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/CampusConnect API/i);
  });

  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  test("GET /api/csrf-token returns token JSON", async () => {
    const res = await request(app).get("/api/csrf-token");
    expect(res.status).toBe(200);
    expect(typeof res.body.csrfToken).toBe("string");
    expect(res.body.csrfToken.length).toBeGreaterThan(10);
  });

  test("POST /api/jobs without CSRF returns 403", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Content-Type", "application/json")
      .send({ title: "x", description: "y" });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("EBADCSRFTOKEN");
  });
});
