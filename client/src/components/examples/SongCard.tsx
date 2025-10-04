import SongCard from "../SongCard";

export default function SongCardExample() {
  return (
    <div className="p-4 space-y-4">
      <SongCard
        id="1"
        title="Wonderwall"
        artist="Oasis"
        album="(What's the Story) Morning Glory?"
        onClick={() => console.log("Song clicked")}
      />
      <SongCard
        id="2"
        title="Don't Stop Believin'"
        artist="Journey"
        album="Escape"
        isRequested={true}
        onClick={() => console.log("Song clicked")}
      />
    </div>
  );
}
