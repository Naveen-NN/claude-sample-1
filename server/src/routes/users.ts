import { Router } from "express";
import { z } from "zod";
import * as api from "../services/jsonPlaceholder.js";

const idParam = z.coerce.number().int().positive();

export const usersRouter = Router();

usersRouter.get("/", async (_req, res) => {
  res.json(await api.getUsers());
});

usersRouter.get("/:id", async (req, res) => {
  res.json(await api.getUser(idParam.parse(req.params.id)));
});
