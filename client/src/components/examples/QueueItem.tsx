import QueueItem from "../QueueItem";

export default function QueueItemExample() {
  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <QueueItem
        position={1}
        title="Bohemian Rhapsody"
        artist="Queen"
        requestedBy="John D."
        isPlaying={true}
      />
      <QueueItem
        position={2}
        title="Sweet Child O' Mine"
        artist="Guns N' Roses"
        requestedBy="Sarah M."
      />
    </div>
  );
}
