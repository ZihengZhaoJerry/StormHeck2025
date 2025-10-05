// src/pages/LoginPage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebaseConfig";
import AuthForm from "@/components/AuthForm";  // Your form component

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <AuthForm />  // Your actual login form here
      </div>
    </div>
  );
}