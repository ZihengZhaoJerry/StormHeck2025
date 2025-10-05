// src/pages/LoginPage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebaseConfig";
import AuthForm from "@/components/AuthForm";  // Your form component
import { Card } from "@/components/ui/card";
import { Music, Users, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLocation("/");  // Redirect to home if already logged in
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>  // Or a spinner
      </div>
    );
  }

  if (user) {
    return null;  // Or a brief "Redirecting..." since useEffect handles it
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background py-4 px-2">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <h2 className="mt-4 mb-6 text-center text-4xl font-extrabold text-foreground dark:text-foreground">
          Live Song Requests Made Simple
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-14 w-full">
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
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <div className="mb-8 w-full">
            <AuthForm />
          </div>
          {/* Connect Spotify moved to Landing Page header */}
        </div>
      </div>
    </div>
  );
}