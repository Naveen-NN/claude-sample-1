import { Router } from "express";
import { z } from "zod";
import * as api from "../services/jsonPlaceholder.js";

const idParam = z.coerce.number().int().positive();

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
});

const MAX_SEARCH_RESULTS = 10;

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  const { q } = listQuery.parse(req.query);
  const users = await api.getUsers();
  if (!q) {
    res.json(users);
    return;
  }
  const needle = q.toLowerCase();
  const matches = users.filter((u) =>
    [u.name, u.username, u.email].some((field) => field?.toLowerCase().includes(needle)),
  );
  res.json(matches.slice(0, MAX_SEARCH_RESULTS));
});

usersRouter.get("/:id", async (req, res) => {
  res.json(await api.getUser(idParam.parse(req.params.id)));
});
