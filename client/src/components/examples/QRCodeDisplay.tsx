import QRCodeDisplay from "../QRCodeDisplay";

export default function QRCodeDisplayExample() {
  return (
    <div className="p-8">
      <QRCodeDisplay url="https://example.com/request" position="center" />
    </div>
  );
}
