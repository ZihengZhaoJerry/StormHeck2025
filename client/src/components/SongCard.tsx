import { Check, Music } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  isRequested?: boolean;
  onClick?: () => void;
}

export default function SongCard({ 
  id, 
  title, 
  artist, 
  album, 
  albumArt, 
  isRequested = false,
  onClick 
}: SongCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-transform hover-elevate active-elevate-2",
        isRequested && "border-primary"
      )}
      onClick={onClick}
      data-testid={`card-song-${id}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {albumArt ? (
            <img 
              src={albumArt} 
              alt={album} 
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {isRequested && (
            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate" data-testid={`text-title-${id}`}>
            {title}
          </h3>
          <p className="text-foreground/70 truncate" data-testid={`text-artist-${id}`}>
            {artist}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {album}
          </p>
        </div>
      </div>
    </Card>
  );
}
