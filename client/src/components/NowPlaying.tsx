import { Music, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NowPlayingProps {
  title: string;
  artist: string;
  albumArt?: string;
  album?: string;
}

export default function NowPlaying({ title, artist, albumArt, album }: NowPlayingProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          {albumArt ? (
            <img 
              src={albumArt} 
              alt={album} 
              className="w-80 h-80 rounded-lg object-cover shadow-2xl"
            />
          ) : (
            <div className="w-80 h-80 rounded-lg bg-muted flex items-center justify-center">
              <Music className="h-32 w-32 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/20 backdrop-blur-sm rounded-full p-6 animate-pulse">
              <Pause className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2 max-w-xl">
          <h2 className="text-4xl font-bold" data-testid="text-now-playing-title">
            {title}
          </h2>
          <p className="text-2xl text-foreground/70" data-testid="text-now-playing-artist">
            {artist}
          </p>
          {album && (
            <p className="text-sm text-muted-foreground">{album}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
