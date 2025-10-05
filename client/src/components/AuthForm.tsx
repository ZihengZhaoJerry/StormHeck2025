import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../lib/firebaseConfig";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const auth = getAuth(app);

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setLocation("/"); // Redirect to index after login
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setLocation("/"); // Redirect to index after register
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-center">
      <Card className="w-full p-8">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border p-2 rounded"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <Button
            variant="ghost"
            className="w-full mt-2 text-blue-500"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
