import { Router } from "express";
import { z } from "zod";
import * as api from "../services/jsonPlaceholder.js";

const idParam = z.coerce.number().int().positive();

const postInput = z.object({
  userId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "title is required"),
  body: z.string().trim().min(1, "body is required"),
});

const listQuery = z.object({
  userId: z.coerce.number().int().positive().optional(),
  _page: z.coerce.number().int().positive().optional(),
  _limit: z.coerce.number().int().positive().max(100).optional(),
});

export const postsRouter = Router();

postsRouter.get("/", async (req, res) => {
  const { posts, total } = await api.getPosts(listQuery.parse(req.query));
  if (total !== undefined) res.setHeader("X-Total-Count", String(total));
  res.json(posts);
});

postsRouter.get("/:id", async (req, res) => {
  res.json(await api.getPost(idParam.parse(req.params.id)));
});

postsRouter.get("/:id/comments", async (req, res) => {
  res.json(await api.getComments(idParam.parse(req.params.id)));
});

postsRouter.post("/", async (req, res) => {
  res.status(201).json(await api.createPost(postInput.parse(req.body)));
});

postsRouter.put("/:id", async (req, res) => {
  res.json(await api.updatePost(idParam.parse(req.params.id), postInput.parse(req.body)));
});

postsRouter.patch("/:id", async (req, res) => {
  res.json(await api.patchPost(idParam.parse(req.params.id), postInput.partial().parse(req.body)));
});

postsRouter.delete("/:id", async (req, res) => {
  await api.deletePost(idParam.parse(req.params.id));
  res.status(204).end();
});
