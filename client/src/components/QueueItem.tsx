import { Music } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QueueItemProps {
  position: number;
  title: string;
  artist: string;
  albumArt?: string;
  requestedBy?: string;
  isPlaying?: boolean;
}

export default function QueueItem({ 
  position, 
  title, 
  artist, 
  albumArt, 
  requestedBy,
  isPlaying = false 
}: QueueItemProps) {
  return (
    <Card className={`p-6 ${isPlaying ? 'border-primary' : ''}`} data-testid={`queue-item-${position}`}>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 w-16 text-center">
          <div className={`text-5xl font-black ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`}>
            {position}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {albumArt ? (
            <img 
              src={albumArt} 
              alt={title} 
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <Music className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-semibold truncate" data-testid={`text-song-title-${position}`}>
            {title}
          </h3>
          <p className="text-lg text-foreground/70 truncate" data-testid={`text-artist-${position}`}>
            {artist}
          </p>
          {requestedBy && (
            <p className="text-sm text-muted-foreground mt-1">
              Requested by {requestedBy}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
