// client/src/lib/spotifyHelper.ts

// ---- Toggle verbose logging here ----
const DEBUG_SPOTIFY = true;
const log = (...args: any[]) => { if (DEBUG_SPOTIFY) console.log(...args); };
const error = (...args: any[]) => console.error(...args);

// ---- API call (now with detailed logs) ----
export async function searchSpotify(query: string, type = "track") {
  const started = (typeof performance !== "undefined" ? performance.now() : Date.now());

  if (!query.trim()) {
    log("[searchSpotify] empty query → returning []");
    return [];
  }

  const url = `/api/spotify/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`;
  log("[searchSpotify] → fetch", { query, type, url });

  let res: Response;
  try {
    res = await fetch(url);
  } catch (e: any) {
    error("[searchSpotify] network error:", e?.message || e);
    throw e;
  }

  log("[searchSpotify] status:", res.status, "ok:", res.ok);

  // Try to parse JSON; if it fails, show raw text
  let data: any;
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "<unreadable>");
    error("[searchSpotify] failed to parse JSON. Raw body:", txt);
    throw new Error("Bad JSON from /api/spotify/search");
  }

  if (!res.ok) {
    error("[searchSpotify] API error body:", data);
    throw new Error(`Search failed (${res.status}): ${data?.error ?? "Unknown error"}`);
  }

  // Inspect response shape
  const items =
    (Array.isArray(data?.tracks?.items) && data.tracks.items) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data) && data) ||
    [];
  log("[searchSpotify] shape keys:", Object.keys(data || {}));
  log("[searchSpotify] items count:", items.length);
  if (items[0]) log("[searchSpotify] sample item:", items[0]);

  const ended = (typeof performance !== "undefined" ? performance.now() : Date.now());
  log("[searchSpotify] done in", Math.round(ended - started), "ms");

  // IMPORTANT: return the FULL JSON (not just items) so mappers can read tracks.items
  return data;
}

// ---- Types your UI expects ----
export type UISong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
};

// ---- Pick a good album image from Spotify's images array ----
export function pickImage(
  images: Array<{ url: string; width?: number; height?: number }> = []
): string | undefined {
  if (!images.length) return undefined;
  const byClosest300 = [...images].sort(
    (a, b) => Math.abs((a.width ?? 0) - 300) - Math.abs((b.width ?? 0) - 300)
  );
  return byClosest300[0]?.url ?? images[0]?.url;
}

// ---- Map raw Spotify JSON -> your SongCard shape (with logs) ----
export function mapSpotifyTracksToCards(data: any): UISong[] {
  const items = extractTrackItems(data);
  log("[mapSpotifyTracksToCards] extracted items:", items.length);

  const mapped = items
    .map(mapTrackToUI)
    .filter((v): v is UISong => Boolean(v));

  log("[mapSpotifyTracksToCards] mapped count:", mapped.length);
  if (mapped[0]) log("[mapSpotifyTracksToCards] first mapped:", mapped[0]);

  return mapped;
}

// ---- One-call helper: fetch + map (for your page effect) ----
export async function fetchSongs(query: string): Promise<UISong[]> {
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  log("[fetchSongs] query:", query);

  const data = await searchSpotify(query, "track");
  const songs = mapSpotifyTracksToCards(data);

  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  log("[fetchSongs] done in", Math.round(t1 - t0), "ms →", songs.length, "songs");

  return songs;
}

// ---------- Internals ----------

function extractTrackItems(data: any): any[] {
  // Supports multiple shapes:
  // 1) { tracks: { items: [...] } }  (Spotify Search API - standard)
  // 2) { items: [...] }              (some proxies)
  // 3) [ ... ]                       (already an array)
  if (Array.isArray(data?.tracks?.items)) return data.tracks.items;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

function mapTrackToUI(t: any): UISong | null {
  // Handle track or { track: {...} } wrapper
  const track = t?.track ?? t;
  if (!track?.id || !track?.name) return null;

  const artist =
    (track.artists ?? [])
      .map((a: any) => a?.name)
      .filter(Boolean)
      .join(", ") || "";

  return {
    id: track.id,
    title: track.name,
    artist,
    album: track.album?.name ?? "",
    albumArt: pickImage(track.album?.images ?? []),
  };
}
