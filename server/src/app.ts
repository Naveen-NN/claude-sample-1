import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { postsRouter } from "./routes/posts.js";
import { usersRouter } from "./routes/users.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin, exposedHeaders: ["X-Total-Count"] }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/posts", postsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found", status: 404 });
  });

  app.use(errorHandler);
  return app;
}
