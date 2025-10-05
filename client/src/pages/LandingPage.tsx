import { useState, useEffect, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueItem from "@/components/QueueItem";
import NowPlaying from "@/components/NowPlaying";
import { useLocation } from "wouter";
import EmptyState from "@/components/EmptyState";
import { ListMusic, Search as SearchIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { searchSpotify } from "../lib/spotifyHelper";

// Helper to pick a good album image
function pickImage(
  images: Array<{ url: string; width?: number; height?: number }> = []
) {
  if (!images.length) return undefined;
  const byClosest300 = [...images].sort(
    (a, b) =>
      Math.abs((a.width ?? 0) - 300) - Math.abs((b.width ?? 0) - 300)
  );
  return byClosest300[0]?.url ?? images[0]?.url;
}

// Map Spotify API response to QueueItem-friendly shape
function mapSpotifyTracksToQueue(data: any): UISong[] {
  if (!data?.tracks?.items) return [];
  return data.tracks.items.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: (t.artists ?? []).map((a: any) => a.name).join(", "),
    album: t.album?.name ?? "",
    albumArt: pickImage(t.album?.images ?? []),
    requestedBy: "", // You can fill this if you have user info
    previewUrl: t.preview_url, // <-- add this line
  }));
}

type UISong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  requestedBy?: string;
  previewUrl?: string; // <-- add this line
};

const mockNowPlaying = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  album: "A Night at the Opera",
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UISong[]>([]);
  const [queue, setQueue] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const debounceMs = 350;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nowPlaying, setNowPlaying] = useState<UISong | null>(null);

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
        const data = await searchSpotify(searchQuery, "track");
        const mapped = mapSpotifyTracksToQueue(data);
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

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, toast]);

  const emptyState = useMemo(() => {
    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={ListMusic}
          title="Search for a song"
          description="Start typing to find songs to add to the queue"
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

  // Add song to queue if not already present
  const handleAddToQueue = (song: UISong) => {
    if (queue.some((s) => s.id === song.id)) {
      toast({
        title: "Already in queue",
        description: `"${song.title}" is already in the queue.`,
      });
      return;
    }
    setQueue((prev) => [...prev, song]);
    toast({
      title: "Added to queue",
      description: `"${song.title}" has been added to the queue.`,
    });
  };

  // Set now playing from queue
  const handlePlayFromQueue = (song: UISong) => {
    setNowPlaying(song);
    setActiveTab("now-playing");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">SongRequest</h1>
              <p className="text-muted-foreground">Manage song requests in real-time</p>
            </div>
            </a>
            <div className="flex items-center gap-2">
              <div className="text-right mr-4">
                <p className="text-2xl font-bold text-primary" data-testid="text-queue-count">
                  {queue.length}
                </p>
                <p className="text-sm text-muted-foreground">in queue</p>
              </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 relative">
        <div className="absolute right-0 top-0 mt-2 mr-2 z-10">
          <Button
            variant="outline"
            className="text-lg h-14 px-8"
            onClick={() => setLocation("/qr-code")}
            data-testid="button-qr-code"
          >
            Show QR Code
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 mx-auto mb-6">
            <TabsTrigger value="search" data-testid="tab-search">
              Search
            </TabsTrigger>
            <TabsTrigger value="queue" data-testid="tab-queue">
              Queue
            </TabsTrigger>
            <TabsTrigger value="now-playing" data-testid="tab-now-playing">
              Now Playing
            </TabsTrigger>
          </TabsList>
          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="mb-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            {emptyState ? (
              emptyState
            ) : (
              results.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => handleAddToQueue(song)}
                  style={{ cursor: "pointer" }}
                  className={
                    queue.some((s) => s.id === song.id)
                      ? "opacity-60 pointer-events-none"
                      : "hover:bg-accent/40 rounded transition"
                  }
                  data-testid={`search-result-${song.id}`}
                >
                  <QueueItem
                    position={index + 1}
                    title={song.title}
                    artist={song.artist}
                    requestedBy={song.requestedBy}
                    isPlaying={false}
                  />
                </div>
              ))
            )}
          </TabsContent>
          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            {queue.length === 0 ? (
              <EmptyState
                icon={ListMusic}
                title="Queue is empty"
                description="Add songs from the search tab"
              />
            ) : (
              queue.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => handlePlayFromQueue(song)}
                  style={{ cursor: "pointer" }}
                  className={
                    nowPlaying?.id === song.id
                      ? "ring-2 ring-primary rounded"
                      : "hover:bg-accent/40 rounded transition"
                  }
                  data-testid={`queue-item-${song.id}`}
                >
                  <QueueItem
                    position={index + 1}
                    title={song.title}
                    artist={song.artist}
                    requestedBy={song.requestedBy}
                    isPlaying={nowPlaying?.id === song.id}
                  />
                </div>
              ))
            )}
          </TabsContent>
          {/* Now Playing Tab */}
          <TabsContent value="now-playing">
            <div className="max-w-3xl mx-auto">
              {nowPlaying ? (
                <NowPlaying
                  title={nowPlaying.title}
                  artist={nowPlaying.artist}
                  album={nowPlaying.album}
                  albumArt={nowPlaying.albumArt}
                  previewUrl={nowPlaying.previewUrl} // <-- pass previewUrl
                />
              ) : (
                <EmptyState
                  icon={ListMusic}
                  title="No song playing"
                  description="Select a song from the queue to play"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
