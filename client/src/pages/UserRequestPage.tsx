import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import EmptyState from "@/components/EmptyState";
import { Music, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

// todo: remove mock functionality
const mockSongs = [
  { id: "1", title: "Wonderwall", artist: "Oasis", album: "(What's the Story) Morning Glory?" },
  { id: "2", title: "Don't Stop Believin'", artist: "Journey", album: "Escape" },
  { id: "3", title: "Sweet Child O' Mine", artist: "Guns N' Roses", album: "Appetite for Destruction" },
  { id: "4", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera" },
  { id: "5", title: "Hotel California", artist: "Eagles", album: "Hotel California" },
  { id: "6", title: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV" },
];

export default function UserRequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requestedSongs, setRequestedSongs] = useState<string[]>([]);
  const { toast } = useToast();

  // todo: remove mock functionality
  const filteredSongs = searchQuery
    ? mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockSongs;

  const handleSongRequest = (songId: string, songTitle: string) => {
    if (requestedSongs.includes(songId)) {
      setRequestedSongs(requestedSongs.filter(id => id !== songId));
      toast({
        title: "Request removed",
        description: `"${songTitle}" has been removed from your requests`,
      });
    } else {
      setRequestedSongs([...requestedSongs, songId]);
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
        <ThemeToggle />
      </div>
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {searchQuery && filteredSongs.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No songs found"
            description="Try searching for a different song, artist, or album"
          />
        ) : !searchQuery ? (
          <EmptyState
            icon={Music}
            title="Search for a song"
            description="Start typing to find songs you'd like to request"
          />
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                {...song}
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
            <Button 
              className="w-full h-14 text-lg"
              data-testid="button-view-requests"
            >
              View Your Requests ({requestedSongs.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
