// server/routes.ts
import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";

// Mount sub-routers
import spotifyRouter from "./lib/spotify";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic middleware (adjust as needed)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // ---- Your API routes ----
  app.use("/api/spotify", spotifyRouter);

  // 404 for unknown API routes
  app.use("/api/*", (_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // Centralized error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = typeof err.status === "number" ? err.status : 500;
    res.status(status).json({
      error: err?.message ?? "Internal Server Error",
    });
  });

  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

export default registerRoutes;
