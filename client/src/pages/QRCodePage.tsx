import QRCodeDisplay from "@/components/QRCodeDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { cursorTo } from "readline";

const REQUEST_URL = window.location.origin + "/request-song";

export default function QRCodePage() {
  return (
    <a href = "/" style = {{ cursor: 'default' }}>
    <div className="min-h-screen bg-background flex flex-col items-center dark:bg-[#18181b]">
      <header className="w-full flex justify-end p-4">
        <ThemeToggle />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <QRCodeDisplay url={REQUEST_URL} position="center" />
      </main>
    </div>
    </a>
  );
}
