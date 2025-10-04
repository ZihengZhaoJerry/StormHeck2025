import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Users, Smartphone } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">SongRequest</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-5xl font-black text-foreground">
            Live Song Requests Made Simple
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Let your audience request their favorite songs in real-time. Perfect for performers, DJs, and live events.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/performer">
              <Button size="lg" className="text-lg h-14 px-8" data-testid="button-performer">
                Performer Dashboard
              </Button>
            </Link>
            <Link href="/request">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8" data-testid="button-request">
                Request a Song
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scan & Request</h3>
            <p className="text-muted-foreground">
              Audience members scan a QR code and instantly browse songs to request
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Spotify Integration</h3>
            <p className="text-muted-foreground">
              Search millions of songs with album artwork and artist information
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Queue</h3>
            <p className="text-muted-foreground">
              See requests appear instantly on the performer dashboard
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
