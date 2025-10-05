import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueItem from "@/components/QueueItem";
import NowPlaying from "@/components/NowPlaying";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import EmptyState from "@/components/EmptyState";
import { ListMusic } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

// todo: remove mock functionality
const mockQueue = [
  { id: "1", title: "Wonderwall", artist: "Oasis", requestedBy: "John D." },
  { id: "2", title: "Don't Stop Believin'", artist: "Journey", requestedBy: "Sarah M." },
  { id: "3", title: "Sweet Child O' Mine", artist: "Guns N' Roses", requestedBy: "Mike R." },
];

const mockNowPlaying = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  album: "A Night at the Opera",
};

export default function PerformerDashboard() {
  const [activeTab, setActiveTab] = useState("queue");
  
  // todo: remove mock functionality - get actual URL
  const requestUrl = window.location.origin + "/request";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performer Dashboard</h1>
            <p className="text-muted-foreground">Manage song requests in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <p className="text-2xl font-bold text-primary" data-testid="text-queue-count">
                {mockQueue.length}
              </p>
              <p className="text-sm text-muted-foreground">in queue</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6">
            <TabsTrigger value="queue" data-testid="tab-queue">Queue</TabsTrigger>
            <TabsTrigger value="now-playing" data-testid="tab-now-playing">Now Playing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="space-y-4">
            {mockQueue.length === 0 ? (
              <EmptyState
                icon={ListMusic}
                title="No requests yet"
                description="Song requests will appear here when audience members make selections"
              />
            ) : (
              mockQueue.map((song, index) => (
                <QueueItem
                  key={song.id}
                  position={index + 1}
                  title={song.title}
                  artist={song.artist}
                  requestedBy={song.requestedBy}
                  isPlaying={index === 0}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="now-playing">
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 text-right">
                <a href="/api/spotify/login">
                  <Button>Connect Spotify</Button>
                </a>
              </div>
              <NowPlaying {...mockNowPlaying} spotifyUri={"spotify:track:4uLU6hMCjMI75M1A2tKUQC"} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* <QRCodeDisplay url={requestUrl} position="corner" /> */}
    </div>
  );
}
