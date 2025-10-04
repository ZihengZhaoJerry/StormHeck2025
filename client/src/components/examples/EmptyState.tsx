import { Music } from "lucide-react";
import EmptyState from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <EmptyState
      icon={Music}
      title="No songs found"
      description="Try searching for a different song, artist, or album"
    />
  );
}
