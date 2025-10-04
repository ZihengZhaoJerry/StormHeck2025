import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search songs, artists, albums..." }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 p-4 border-b">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 h-12 rounded-full text-base"
          data-testid="input-search"
        />
      </div>
    </div>
  );
}
