import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Spotify token endpoint using fetch
  app.post("/api/spotify/token", async (req: Request, res: Response) => {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Spotify credentials not set" });
      }
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({ error: data.error_description || "Spotify token error" });
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });



  const httpServer = createServer(app);

  return httpServer;
}
