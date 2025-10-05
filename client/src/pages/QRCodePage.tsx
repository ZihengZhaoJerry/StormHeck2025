import QRCodeDisplay from "@/components/QRCodeDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function QRCodePage() 
{
  const sessionKey = useMemo(() => {
  const saved = sessionStorage.getItem("qrSession");
  if (saved) return saved;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
  const key = btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  sessionStorage.setItem("qrSession", key);
  return key;
}, []);

  // Example: Replace with dynamic eventId if needed
  const eventId = "stormheck2025"; 

  const [, setLocation] = useLocation();
  const REQUEST_URL = `${window.location.origin}/request?eventId=${eventId}&session=${sessionKey}`;

  return (
    <a onClick={() => setLocation("/")} style = {{ cursor: 'default' }}>
    <div className="min-h-screen bg-background flex flex-col items-center dark:bg-[#18181b]">
      <header className="w-full flex justify-end p-4">
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <QRCodeDisplay url={REQUEST_URL} position="center" />
      </main>
    </div>
    </a>
  );
}
