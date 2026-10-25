import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UpstreamError } from "../services/jsonPlaceholder.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", status: 400, issues: err.issues });
    return;
  }
  if (err instanceof UpstreamError) {
    const status = err.status === 404 ? 404 : 502;
    res.status(status).json({ error: status === 404 ? "Not found" : err.message, status });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error", status: 500 });
};
