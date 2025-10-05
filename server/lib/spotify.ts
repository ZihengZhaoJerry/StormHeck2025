// server/lib/spotify.ts
import { Router, Request, Response } from "express";
import { searchSpotify } from "../../client/src/lib/spotifyHelper.ts";

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

// Default production host for redirects (use your deployed Render URL)
const DEFAULT_APP_ORIGIN = "https://stormheck2025.onrender.com";
const DEFAULT_REDIRECT_PATH = "/api/spotify/callback";
const DEFAULT_REDIRECT_URI = `${process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_APP_ORIGIN + DEFAULT_REDIRECT_PATH}`;
const DEFAULT_CLIENT_URL = process.env.CLIENT_URL ?? DEFAULT_APP_ORIGIN;

// Simple in-memory storage for a single performer's user tokens (demo only).
// For production you'd persist this per-user in a DB and secure it.
// Backwards-compatible single performer storage (kept for simple demo setups)
let performerTokens: {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  spotify_user_id?: string;
} | null = null;

// Multi-user token storage: map from your app user id -> tokens. Demo-only (in-memory).
const userTokens = new Map<string, { access_token: string; refresh_token: string; expires_at: number; spotify_user_id?: string }>();

const router = Router();

// Search uses the server-side app token (client credentials)
// We'll keep the existing server-side spotifySearch function (client credentials)
let appTokenCache: { access_token: string; expires_at: number } | null = null;

async function getAppToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (appTokenCache && appTokenCache.expires_at - 30 > now) return appTokenCache.access_token;

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basic}` },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(`Spotify token error: ${resp.status} ${JSON.stringify(data)}`);

  appTokenCache = { access_token: data.access_token, expires_at: Math.floor(Date.now() / 1000) + data.expires_in };
  return appTokenCache.access_token;
}

export async function spotifySearch(q: string, type = "track") {
  const token = await getAppToken();
  const url = new URL(`${SPOTIFY_BASE_URL}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("type", type);

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(`Spotify API error: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

// ----------------- Routes -----------------

// Search route (existing behavior)
router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) ?? "";
    const type = (req.query.type as string) ?? "track";

    if (!q.trim()) return res.status(400).json({ error: "Missing search query (q parameter)" });

    const data = await spotifySearch(q, type);
    res.status(200).json(data);
  } catch (err: any) {
    console.error("Spotify route error:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// Start Spotify OAuth (redirects user to Spotify login/consent)
router.get("/login", (req: Request, res: Response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  // prefer explicit env var, otherwise default to deployed app origin
  const redirectUri = (process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT_URI).toString();
  if (!clientId) return res.status(500).send("SPOTIFY_CLIENT_ID not configured");

  const scopes = ["user-modify-playback-state", "user-read-playback-state", "user-read-currently-playing"].join(" ");

  // allow caller to pass a userId so we can associate the Spotify account with that user
  const { userId } = req.query as { userId?: string };

  // Use state to help round-trip the userId (encoded JSON)
  const rawState = JSON.stringify({ s: Math.random().toString(36).slice(2, 15), userId: userId ?? null });
  const state = Buffer.from(rawState).toString("base64url");

  const params = new URLSearchParams({ response_type: "code", client_id: clientId, scope: scopes, redirect_uri: redirectUri, state, show_dialog: "true" });
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log(`[spotify] redirecting to authorize URL; redirect_uri=${redirectUri}`);
  console.log(`[spotify] full authorize url: ${url}`);
  res.redirect(url);
});

// Debug helper: return the computed redirect URI and an example authorize URL
router.get("/redirect-uri", (req: Request, res: Response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = (process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT_URI).toString();
  const scopes = ["user-modify-playback-state", "user-read-playback-state", "user-read-currently-playing"].join(" ");
  const params = new URLSearchParams({ response_type: "code", client_id: clientId ?? "<client_id>", scope: scopes, redirect_uri: redirectUri, show_dialog: "true" });
  const example = `https://accounts.spotify.com/authorize?${params.toString()}`;
  res.json({ redirectUri, exampleAuthorizeUrl: example, clientUrl: DEFAULT_CLIENT_URL });
});

// OAuth callback: exchange code for tokens and cache them for the performer
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const error = req.query.error as string | undefined;
    const redirectUri = (process.env.SPOTIFY_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/spotify/callback`).toString();

    // parse state to retrieve optional userId
    const stateParam = req.query.state as string | undefined;
    let stateUserId: string | null = null;
    if (stateParam) {
      try {
        const decoded = Buffer.from(stateParam, "base64url").toString();
        const obj = JSON.parse(decoded);
        stateUserId = obj?.userId ?? null;
      } catch {
        stateUserId = null;
      }
    }

    if (error) {
      console.error("Spotify callback error:", error);
      return res.status(400).send(`Spotify auth failed: ${error}`);
    }
    if (!code) return res.status(400).send("Missing code");

    const id = process.env.SPOTIFY_CLIENT_ID!;
    const secret = process.env.SPOTIFY_CLIENT_SECRET!;
    const basic = Buffer.from(`${id}:${secret}`).toString("base64");

    const tokenResp = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });

    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok) {
      console.error("Spotify token exchange failed:", tokenJson);
      return res.status(500).json({ error: tokenJson });
    }

    // Build token object
    const tokenObj = {
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (tokenJson.expires_in || 3600),
    };

    // If a userId was supplied in the state, store tokens under that user
    if (stateUserId) {
      userTokens.set(stateUserId, tokenObj);
    } else {
      // fallback to the legacy single performerTokens
      performerTokens = tokenObj;
    }

    // Fetch user's Spotify id and display name for logs and status
    const meToken = tokenObj.access_token;
    const me = await fetch("https://api.spotify.com/v1/me", { headers: { Authorization: `Bearer ${meToken}` } });
    const meJson = await me.json();
    if (me.ok) {
      const idToSet = meJson.id;
      if (stateUserId) {
        const existing = userTokens.get(stateUserId)!;
        existing.spotify_user_id = idToSet;
        userTokens.set(stateUserId, existing);
        console.log("Connected Spotify userId", stateUserId, "->", idToSet, meJson.display_name ?? "(no-name)");
      } else if (performerTokens) {
        performerTokens.spotify_user_id = idToSet;
        console.log("Connected Spotify performer:", idToSet, meJson.display_name ?? "(no-name)");
      }
    }

    // Redirect to client (dev default 5173) and indicate success
  const clientUrl = process.env.CLIENT_URL ?? DEFAULT_CLIENT_URL;
  const redirectTo = `${clientUrl}/?spotify_connected=1`;
    res.redirect(redirectTo);
  } catch (err: any) {
    console.error("Spotify callback exception:", err);
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// Helper: refresh performer access token if expired
async function refreshPerformerTokenIfNeeded() {
  throw new Error("refreshPerformerTokenIfNeeded should not be called without a userId in the new multi-user flow");
}

// Refresh tokens for a given token object (in-place update)
async function refreshTokenIfNeededForTokenObj(tokenObj: { access_token: string; refresh_token: string; expires_at: number }) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenObj.expires_at - 30 > now) return; // still valid

  const id = process.env.SPOTIFY_CLIENT_ID!;
  const secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokenObj.refresh_token }),
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(`Failed to refresh token: ${resp.status} ${JSON.stringify(json)}`);

  tokenObj.access_token = json.access_token;
  tokenObj.expires_at = Math.floor(Date.now() / 1000) + (json.expires_in || 3600);
  if (json.refresh_token) tokenObj.refresh_token = json.refresh_token; // occasionally returned
}

// Play a track on the connected performer's active Spotify device
router.post("/play", async (req: Request, res: Response) => {
  try {
    const { id, uri, userId } = req.body as { id?: string; uri?: string; userId?: string };

    // decide which token store to use: user-specific or legacy performerTokens
    let tokenObj: { access_token: string; refresh_token: string; expires_at: number } | null = null;
    if (userId) {
      const ut = userTokens.get(userId);
      if (!ut) return res.status(401).json({ error: `Spotify not connected for userId ${userId}` });
      tokenObj = ut;
    } else if (performerTokens) {
      tokenObj = performerTokens;
    } else {
      return res.status(401).json({ error: "No Spotify connection found. Connect via /api/spotify/login" });
    }

    await refreshTokenIfNeededForTokenObj(tokenObj);

    const playBody: any = {};
    if (uri) playBody.uris = [uri];
    else if (id) playBody.uris = [`spotify:track:${id}`];
    else return res.status(400).json({ error: "Missing id or uri in body" });

    const resp = await fetch(`${SPOTIFY_BASE_URL}/me/player/play`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenObj.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(playBody),
    });

  if (resp.status === 204) return res.status(200).json({ ok: true });
    const json = await resp.json().catch(() => ({}));
    // If 404 with no active device, provide helpful message
    if (resp.status === 404) {
      return res.status(404).json({ error: "No active Spotify device found. Start Spotify on a device (phone/desktop) and try again." });
    }

    if (!resp.ok) {
      console.error("Play failed:", resp.status, json);
      return res.status(500).json({ error: json || `Play failed: ${resp.status}` });
    }

    res.status(200).json({ ok: true, data: json });
  } catch (err: any) {
    console.error("/play error:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// Return connection status for the performer (demo)
router.get("/status", async (req: Request, res: Response) => {
  const { userId } = req.query as { userId?: string };
  let tokenObj = null;
  if (userId) tokenObj = userTokens.get(userId) ?? null;
  else tokenObj = performerTokens;

  if (!tokenObj) return res.status(200).json({ connected: false });

  // attempt to fetch display name if we didn't store it
  let display_name: string | undefined = undefined;
  try {
    const me = await fetch(`${SPOTIFY_BASE_URL}/me`, { headers: { Authorization: `Bearer ${tokenObj.access_token}` } });
    if (me.ok) {
      const j = await me.json();
      display_name = j.display_name;
    }
  } catch (e) {
    // ignore
  }
  return res.status(200).json({ connected: true, spotify_user_id: tokenObj.spotify_user_id, display_name });
});

// Disconnect performer or user tokens: clear tokens
router.post("/disconnect", (req: Request, res: Response) => {
  const { userId } = req.query as { userId?: string };
  if (userId) {
    userTokens.delete(userId);
    return res.status(200).json({ ok: true });
  }
  performerTokens = null;
  return res.status(200).json({ ok: true });
});

export default router;
