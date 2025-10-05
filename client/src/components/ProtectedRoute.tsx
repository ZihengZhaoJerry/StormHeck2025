import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useLocation } from "wouter";
import { app } from "@/lib/firebaseConfig";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) setLocation("/login");
    });
    return unsubscribe;
  }, [setLocation]);

  if (loading) return null; // or a loading spinner

  return user ? children : null;
}

// Removed duplicate default export