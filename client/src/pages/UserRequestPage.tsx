"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import EmptyState from "@/components/EmptyState";
import { Music, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Keeping your current import name/path:
import { searchSpotify } from "../lib/spotifyHelper";

// ---------- Helpers (add these) ----------

// Choose a good-sized album image from Spotify's images array
function pickImage(
  images: Array<{ url: string; width?: number; height?: number }> = []
) {
  if (!images.length) return undefined;
  // Prefer ~300px wide if available
  const byClosest300 = [...images].sort(
    (a, b) =>
      Math.abs((a.width ?? 0) - 300) - Math.abs((b.width ?? 0) - 300)
  );
  return byClosest300[0]?.url ?? images[0]?.url;
}

// Convert Spotify API response into your SongCard-friendly shape
function mapSpotifyTracksToCards(data: any): UISong[] {
  if (!data?.tracks?.items) return [];
  return data.tracks.items.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: (t.artists ?? []).map((a: any) => a.name).join(", "),
    album: t.album?.name ?? "",
    albumArt: pickImage(t.album?.images ?? []),
  }));
}

// ---------- Types ----------

type UISong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string; // <— add this so SongCard can show the cover
};

// ---------- Page ----------

export default function UserRequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UISong[]>([]);
  const [requestedSongs, setRequestedSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // simple debounce to avoid spamming your API
  const debounceMs = 350;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchSpotify(searchQuery, "track"); // your existing helper
        const mapped = mapSpotifyTracksToCards(data);           // <-- use the mapper
        setResults(mapped);
      } catch (err: any) {
        toast({
          title: "Search failed",
          description: err?.message ?? "Could not fetch songs.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    // cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, toast]);

  const emptyState = useMemo(() => {
    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={Music}
          title="Search for a song"
          description="Start typing to find songs you'd like to request"
        />
      );
    }
    if (loading) {
      return (
        <EmptyState
          icon={SearchIcon}
          title="Searching…"
          description="Looking for tracks that match your query"
        />
      );
    }
    if (results.length === 0) {
      return (
        <EmptyState
          icon={SearchIcon}
          title="No songs found"
          description="Try searching for a different song, artist, or album"
        />
      );
    }
    return null;
  }, [loading, results.length, searchQuery]);

  const handleSongRequest = (songId: string, songTitle: string) => {
    if (requestedSongs.includes(songId)) {
      setRequestedSongs((prev) => prev.filter((id) => id !== songId));
      toast({
        title: "Request removed",
        description: `"${songTitle}" has been removed from your requests`,
      });
    } else {
      setRequestedSongs((prev) => [...prev, songId]);
      toast({
        title: "Song requested!",
        description: `"${songTitle}" has been added to the queue`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Request a Song</h1>
        {/* <ThemeToggle /> */}
      </div>

      {/* Controlled search bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="max-w-2xl mx-auto p-4 pb-24">
        {emptyState ? (
          emptyState
        ) : (
          <div className="space-y-3">
            {results.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                title={song.title}
                artist={song.artist}
                album={song.album}
                albumArt={song.albumArt}   // <-- shows the album cover
                isRequested={requestedSongs.includes(song.id)}
                onClick={() => handleSongRequest(song.id, song.title)}
              />
            ))}
          </div>
        )}
      </div>

      {requestedSongs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t">
          <div className="max-w-2xl mx-auto">
            <Button className="w-full h-14 text-lg" data-testid="button-view-requests">
              View Your Requests ({requestedSongs.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
