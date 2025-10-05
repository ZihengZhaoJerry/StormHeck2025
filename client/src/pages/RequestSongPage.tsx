import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

export default function RequestSongPage() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center dark:bg-[#18181b]">
      <header className="w-full flex justify-end p-4">
        <ThemeToggle />
      </header>
      <main className="flex-1 flex flex-col items-center w-full px-4 mt-8">
        <Button
          size="lg"
          className="text-lg h-14 px-8 w-full max-w-xs mb-8"
          data-testid="button-request"
          onClick={() => setLocation("/request")}
        >
          Request a Song
        </Button>
      </main>
    </div>
  );
}
