import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Status } from "@prisma/client";

const citizenUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "citizen@test.com",
  display_name: "Citizen User",
  role: "citizen",
  points: 0,
  level: 1,
};

const adminUser = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "admin@test.com",
  display_name: "Admin User",
  role: "admin",
  points: 300,
  level: 4,
};

const reportId = "33333333-3333-4333-8333-333333333333";

const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  report: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  vote: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  statusHistory: {
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $queryRawUnsafe: vi.fn(),
  $transaction: vi.fn(),
};

const mockUploadSingle = vi.fn();
const mockGetUploadedFileUrl = vi.fn(
  () => "http://localhost:3000/uploads/test-image.jpg",
);
const mockRemoveUploadedFile = vi.fn();
const mockSendStatusChangeEmail = vi.fn(() => Promise.resolve());
const mockAddPoints = vi.fn(async (tx, userId) => ({
  id: userId,
  points: 10,
  level: 1,
}));

vi.mock("../src/db.js", () => ({
  default: mockPrisma,
  initializeDatabase: vi.fn(),
}));

vi.mock("../src/middleware/uploadMiddleware.js", () => ({
  upload: {
    single: (...args) => {
      mockUploadSingle(...args);
      return (req, res, next) => {
        if (req.headers["x-test-no-image"] === "1") {
          return next();
        }

        req.file = {
          filename: "test-image.jpg",
          path: "/tmp/test-image.jpg",
        };

        return next();
      };
    },
  },
  getUploadedFileUrl: (...args) => mockGetUploadedFileUrl(...args),
  removeUploadedFile: (...args) => mockRemoveUploadedFile(...args),
}));

vi.mock("../src/utils/email.js", () => ({
  sendStatusChangeEmail: (...args) => mockSendStatusChangeEmail(...args),
}));

vi.mock("../src/utils/gamification.js", async () => {
  const actual = await vi.importActual("../src/utils/gamification.js");

  return {
    ...actual,
    addPoints: (...args) => mockAddPoints(...args),
  };
});

const { default: app } = await import("../src/app.js");
const { signToken } = await import("../src/utils/auth.js");

const authHeader = (user) => ({ Authorization: `Bearer ${signToken(user)}` });

beforeEach(() => {
  vi.clearAllMocks();

  mockPrisma.$transaction.mockImplementation(async (callback) =>
    callback(mockPrisma),
  );
});

describe("App and auth endpoints", () => {
  it("GET /health returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("GET /api returns API welcome message", async () => {
    const response = await request(app).get("/api");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("UrbanPulse API");
  });

  it("POST /api/auth/register validates required fields", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "a@b.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("required");
  });

  it("POST /api/auth/register creates user and returns token", async () => {
    mockPrisma.user.create.mockResolvedValueOnce({
      ...citizenUser,
      password_hash: "hashed-password",
    });

    const response = await request(app).post("/api/auth/register").send({
      email: " Citizen@Test.com ",
      password: "verysecurepassword",
      display_name: "Citizen User",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe("citizen@test.com");
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("POST /api/auth/login returns 401 on invalid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const response = await request(app).post("/api/auth/login").send({
      email: "citizen@test.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("invalid credentials");
  });

  it("POST /api/auth/login returns token on success", async () => {
    const passwordHash = await bcrypt.hash("validpassword", 10);

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      ...citizenUser,
      password_hash: passwordHash,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "citizen@test.com",
      password: "validpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.id).toBe(citizenUser.id);
  });
});

describe("Reports endpoints", () => {
  it("POST /api/reports requires authentication", async () => {
    const response = await request(app).post("/api/reports").send({});

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("missing bearer token");
  });

  it("POST /api/reports validates image requirement", async () => {
    const response = await request(app)
      .post("/api/reports")
      .set(authHeader(citizenUser))
      .set("x-test-no-image", "1")
      .send({
        category: "illegal_dump",
        title: "No image report",
        latitude: "42.7",
        longitude: "23.3",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("image is required");
  });

  it("POST /api/reports creates a report", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      {
        id: reportId,
        user_id: citizenUser.id,
        category: "illegal_dump",
        title: "Illegal dump near park",
        description: "Trash is piling up",
        image_url: "http://localhost:3000/uploads/test-image.jpg",
        status: "submitted",
        heat_score: 0,
        vote_count: 0,
        created_at: new Date("2026-01-01T12:00:00.000Z"),
        updated_at: new Date("2026-01-01T12:00:00.000Z"),
        resolved_at: null,
        latitude: 42.7,
        longitude: 23.3,
        author_display_name: citizenUser.display_name,
      },
    ]);

    const response = await request(app)
      .post("/api/reports")
      .set(authHeader(citizenUser))
      .send({
        category: "illegal_dump",
        title: "Illegal dump near park",
        description: "Trash is piling up",
        latitude: "42.7",
        longitude: "23.3",
      });

    expect(response.status).toBe(201);
    expect(response.body.report.id).toBe(reportId);
    expect(response.body.report.category).toBe("illegal_dump");
  });

  it("GET /api/reports validates filters", async () => {
    const response = await request(app)
      .get("/api/reports")
      .query({ status: "bad_status" });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("status must be one of");
  });

  it("GET /api/reports returns report list with pagination", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      {
        id: reportId,
        user_id: citizenUser.id,
        category: "illegal_dump",
        title: "Illegal dump near park",
        description: "Trash is piling up",
        image_url: "http://localhost:3000/uploads/test-image.jpg",
        status: "submitted",
        heat_score: 0,
        vote_count: 0,
        created_at: new Date("2026-01-01T12:00:00.000Z"),
        updated_at: new Date("2026-01-01T12:00:00.000Z"),
        resolved_at: null,
        latitude: 42.7,
        longitude: 23.3,
        author_display_name: citizenUser.display_name,
      },
    ]);

    const response = await request(app)
      .get("/api/reports")
      .query({ limit: 10, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body.reports).toHaveLength(1);
    expect(response.body.pagination.limit).toBe(10);
  });

  it("GET /api/reports/:id validates UUID", async () => {
    const response = await request(app).get("/api/reports/not-a-uuid");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("report id must be a valid UUID");
  });

  it("GET /api/reports/:id returns report with status history", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      {
        id: reportId,
        user_id: citizenUser.id,
        category: "illegal_dump",
        title: "Illegal dump near park",
        description: "Trash is piling up",
        image_url: "http://localhost:3000/uploads/test-image.jpg",
        status: "submitted",
        heat_score: 0,
        vote_count: 0,
        created_at: new Date("2026-01-01T12:00:00.000Z"),
        updated_at: new Date("2026-01-01T12:00:00.000Z"),
        resolved_at: null,
        latitude: 42.7,
        longitude: 23.3,
        author_display_name: citizenUser.display_name,
      },
    ]);

    mockPrisma.statusHistory.findMany.mockResolvedValueOnce([
      {
        id: "44444444-4444-4444-8444-444444444444",
        report_id: reportId,
        changed_by: adminUser.id,
        old_status: "submitted",
        new_status: "in_progress",
        comment: "Assigned to team",
        changed_at: new Date("2026-01-02T12:00:00.000Z"),
        admin: {
          id: adminUser.id,
          display_name: adminUser.display_name,
        },
      },
    ]);

    const response = await request(app).get(`/api/reports/${reportId}`);

    expect(response.status).toBe(200);
    expect(response.body.report.id).toBe(reportId);
    expect(response.body.status_history).toHaveLength(1);
  });
});

describe("Votes, status updates, and admin analytics", () => {
  it("POST /api/reports/:id/vote records a vote", async () => {
    mockPrisma.report.findUnique.mockResolvedValueOnce({ id: reportId });
    mockPrisma.vote.create.mockResolvedValueOnce({});
    mockPrisma.report.update.mockResolvedValueOnce({
      id: reportId,
      vote_count: 1,
    });

    const response = await request(app)
      .post(`/api/reports/${reportId}/vote`)
      .set(authHeader(citizenUser));

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("vote recorded");
    expect(response.body.report.vote_count).toBe(1);
  });

  it("DELETE /api/reports/:id/vote returns 404 when vote does not exist", async () => {
    mockPrisma.vote.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .delete(`/api/reports/${reportId}/vote`)
      .set(authHeader(citizenUser));

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("vote not found");
  });

  it("PATCH /api/reports/:id/status blocks non-admin users", async () => {
    const response = await request(app)
      .patch(`/api/reports/${reportId}/status`)
      .set(authHeader(citizenUser))
      .send({ new_status: "in_progress" });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("insufficient permissions");
  });

  it("PATCH /api/reports/:id/status updates status for admin users", async () => {
    mockPrisma.report.findUnique.mockResolvedValueOnce({
      id: reportId,
      user_id: citizenUser.id,
      title: "Illegal dump near park",
      status: Status.submitted,
      resolved_at: null,
      user: { email: citizenUser.email },
    });

    mockPrisma.report.update.mockResolvedValueOnce({
      id: reportId,
      user_id: citizenUser.id,
      status: Status.in_progress,
      updated_at: new Date("2026-01-03T12:00:00.000Z"),
      resolved_at: null,
    });

    mockPrisma.statusHistory.create = vi.fn().mockResolvedValueOnce({
      id: "55555555-5555-4555-8555-555555555555",
      report_id: reportId,
      changed_by: adminUser.id,
      old_status: Status.submitted,
      new_status: Status.in_progress,
      comment: "Assigned to ops team",
      changed_at: new Date("2026-01-03T12:00:00.000Z"),
    });

    const response = await request(app)
      .patch(`/api/reports/${reportId}/status`)
      .set(authHeader(adminUser))
      .send({ new_status: "in_progress", comment: "Assigned to ops team" });

    expect(response.status).toBe(200);
    expect(response.body.report.status).toBe(Status.in_progress);
    expect(mockSendStatusChangeEmail).toHaveBeenCalledTimes(1);
  });

  it("GET /api/admin/analytics/summary requires admin role", async () => {
    const response = await request(app)
      .get("/api/admin/analytics/summary")
      .set(authHeader(citizenUser));

    expect(response.status).toBe(403);
  });

  it("GET /api/admin/analytics/summary returns analytics for admins", async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ total: 5, avg_resolution_hours: 12.5 }])
      .mockResolvedValueOnce([{ status: "submitted", count: 2 }])
      .mockResolvedValueOnce([{ category: "illegal_dump", count: 3 }]);

    const response = await request(app)
      .get("/api/admin/analytics/summary")
      .set(authHeader(adminUser));

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(5);
    expect(response.body.by_status[0].status).toBe("submitted");
  });

  it("GET /api/admin/analytics/trend validates period", async () => {
    const response = await request(app)
      .get("/api/admin/analytics/trend")
      .set(authHeader(adminUser))
      .query({ period: "daily" });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("period must be weekly or monthly");
  });

  it("GET /api/admin/analytics/reports returns export-ready rows", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
      {
        id: reportId,
        title: "Illegal dump near park",
        category: "illegal_dump",
        status: "submitted",
        vote_count: 2,
        heat_score: 3.2,
        created_at: new Date("2026-01-01T12:00:00.000Z"),
        resolved_at: null,
      },
    ]);

    const response = await request(app)
      .get("/api/admin/analytics/reports")
      .set(authHeader(adminUser));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(reportId);
  });
});
