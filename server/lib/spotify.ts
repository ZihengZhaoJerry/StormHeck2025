// server/lib/spotify.ts
const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

// In-memory token cache
let cachedToken: { access_token: string; expires_at: number } | null = null;

// Server-only: fetch and cache an app token (Client Credentials flow)
async function getAppToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedToken.expires_at - 30 > now) {
    return cachedToken.access_token;
  }

  const id = process.env.SPOTIFY_CLIENT_ID!;
  const secret = process.env.SPOTIFY_CLIENT_SECRET!;
  if (!id || !secret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Spotify token error: ${resp.status} ${JSON.stringify(data)}`);
  }

  cachedToken = {
    access_token: data.access_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
  };

  return cachedToken.access_token;
}

import { Router, Request, Response } from "express";
import { searchSpotify } from "../../client/src/lib/spotifyHelper.ts";
const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) ?? "";
    const type = (req.query.type as string) ?? "track";

    if (!q.trim()) {
      return res.status(400).json({ error: "Missing search query (q parameter)" });
    }

    const data = await spotifySearch(q, type);
    res.status(200).json(data);
  } catch (err: any) {
    console.error("Spotify route error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

export async function spotifySearch(q: string, type = "track") {
  const token = await getAppToken();

  const url = new URL(`${SPOTIFY_BASE_URL}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("type", type);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status} ${JSON.stringify(json)}`);
  }

  return json;
}
