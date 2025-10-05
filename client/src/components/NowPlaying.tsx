import { Music, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

interface NowPlayingProps {
  title: string;
  artist: string;
  albumArt?: string;
  album?: string;
  previewUrl?: string;
}

export default function NowPlaying({ title, artist, albumArt, album, previewUrl }: NowPlayingProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Spotify preview is 30s

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [previewUrl]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

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

        {previewUrl ? (
          <div className="w-full max-w-md flex flex-col items-center gap-2">
            <audio
              ref={audioRef}
              src={previewUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (audioRef.current) setDuration(audioRef.current.duration || 30);
              }}
              onEnded={() => setIsPlaying(false)}
              autoPlay
            />
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="px-2 py-1 rounded bg-accent"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <span className="text-xs w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-primary"
                step={0.01}
              />
              <span className="text-xs w-10">{formatTime(duration)}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No preview available for this song.
          </div>
        )}
      </div>
    </Card>
  );
}
