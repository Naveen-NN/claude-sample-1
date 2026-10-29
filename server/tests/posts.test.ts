import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import * as api from "../src/services/jsonPlaceholder.js";

vi.mock("../src/services/jsonPlaceholder.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/services/jsonPlaceholder.js")>();
  return {
    UpstreamError: actual.UpstreamError,
    getPosts: vi.fn(),
    getPost: vi.fn(),
    getComments: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    patchPost: vi.fn(),
    deletePost: vi.fn(),
    getUsers: vi.fn(),
    getUser: vi.fn(),
  };
});

const mocked = vi.mocked(api);
const app = createApp();
const post = { id: 1, userId: 1, title: "t", body: "b" };

beforeEach(() => vi.clearAllMocks());

describe("posts API", () => {
  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("lists posts with query and total count", async () => {
    mocked.getPosts.mockResolvedValue({ posts: [post], total: 100 });
    const res = await request(app).get("/api/posts?userId=1&_page=2&_limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([post]);
    expect(res.headers["x-total-count"]).toBe("100");
    expect(mocked.getPosts).toHaveBeenCalledWith({ userId: 1, _page: 2, _limit: 10 });
  });

  it("gets one post", async () => {
    mocked.getPost.mockResolvedValue(post);
    const res = await request(app).get("/api/posts/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(post);
  });

  it("maps upstream 404 to 404", async () => {
    mocked.getPost.mockRejectedValue(new api.UpstreamError(404, "nope"));
    const res = await request(app).get("/api/posts/999");
    expect(res.status).toBe(404);
  });

  it("maps other upstream errors to 502", async () => {
    mocked.getPost.mockRejectedValue(new api.UpstreamError(500, "boom"));
    const res = await request(app).get("/api/posts/1");
    expect(res.status).toBe(502);
  });

  it("rejects an invalid id", async () => {
    const res = await request(app).get("/api/posts/abc");
    expect(res.status).toBe(400);
    expect(mocked.getPost).not.toHaveBeenCalled();
  });

  it("gets comments for a post", async () => {
    const comment = { id: 1, postId: 1, name: "n", email: "e@x.com", body: "c" };
    mocked.getComments.mockResolvedValue([comment]);
    const res = await request(app).get("/api/posts/1/comments");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([comment]);
  });

  it("creates a post", async () => {
    mocked.createPost.mockResolvedValue({ ...post, id: 101 });
    const res = await request(app).post("/api/posts").send({ userId: 1, title: "t", body: "b" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(101);
  });

  it("rejects an invalid create body", async () => {
    const res = await request(app).post("/api/posts").send({ userId: 1, title: "" });
    expect(res.status).toBe(400);
    expect(res.body.issues.length).toBeGreaterThan(0);
    expect(mocked.createPost).not.toHaveBeenCalled();
  });

  it("updates a post", async () => {
    mocked.updatePost.mockResolvedValue(post);
    const res = await request(app).put("/api/posts/1").send({ userId: 1, title: "t", body: "b" });
    expect(res.status).toBe(200);
    expect(mocked.updatePost).toHaveBeenCalledWith(1, { userId: 1, title: "t", body: "b" });
  });

  it("patches a post", async () => {
    mocked.patchPost.mockResolvedValue({ ...post, title: "new" });
    const res = await request(app).patch("/api/posts/1").send({ title: "new" });
    expect(res.status).toBe(200);
    expect(mocked.patchPost).toHaveBeenCalledWith(1, { title: "new" });
  });

  it("deletes a post", async () => {
    mocked.deletePost.mockResolvedValue(undefined);
    const res = await request(app).delete("/api/posts/1");
    expect(res.status).toBe(204);
  });
});

describe("users API", () => {
  const user = { id: 1, name: "Leanne Graham", username: "Bret", email: "e@x.com" };

  it("lists users", async () => {
    mocked.getUsers.mockResolvedValue([user] as never);
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([user]);
  });

  describe("search with ?q=", () => {
    const users = [
      { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" },
      { id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv" },
      { id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net" },
    ];

    it("filters by name, case-insensitively", async () => {
      mocked.getUsers.mockResolvedValue(users as never);
      const res = await request(app).get("/api/users?q=LEANNE");
      expect(res.status).toBe(200);
      expect(res.body.map((u: { id: number }) => u.id)).toEqual([1]);
    });

    it("matches username and email", async () => {
      mocked.getUsers.mockResolvedValue(users as never);
      const byUsername = await request(app).get("/api/users?q=antonette");
      expect(byUsername.body.map((u: { id: number }) => u.id)).toEqual([2]);
      const byEmail = await request(app).get("/api/users?q=yesenia");
      expect(byEmail.body.map((u: { id: number }) => u.id)).toEqual([3]);
    });

    it("returns an empty list when nothing matches", async () => {
      mocked.getUsers.mockResolvedValue(users as never);
      const res = await request(app).get("/api/users?q=zzz");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns all users for a blank query", async () => {
      mocked.getUsers.mockResolvedValue(users as never);
      const res = await request(app).get("/api/users?q=%20%20");
      expect(res.body).toHaveLength(3);
    });

    it("caps results at 10", async () => {
      const many = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}`, username: "u", email: "e" }));
      mocked.getUsers.mockResolvedValue(many as never);
      const res = await request(app).get("/api/users?q=user");
      expect(res.body).toHaveLength(10);
    });

    it("rejects an over-long query", async () => {
      const res = await request(app).get(`/api/users?q=${"a".repeat(101)}`);
      expect(res.status).toBe(400);
      expect(mocked.getUsers).not.toHaveBeenCalled();
    });
  });

  it("gets one user", async () => {
    mocked.getUser.mockResolvedValue(user as never);
    const res = await request(app).get("/api/users/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(user);
    expect(mocked.getUser).toHaveBeenCalledWith(1);
  });

  it("maps upstream 404 to 404", async () => {
    mocked.getUser.mockRejectedValue(new api.UpstreamError(404, "nope"));
    const res = await request(app).get("/api/users/999");
    expect(res.status).toBe(404);
  });

  it("rejects an invalid id", async () => {
    const res = await request(app).get("/api/users/abc");
    expect(res.status).toBe(400);
    expect(mocked.getUser).not.toHaveBeenCalled();
  });
});
