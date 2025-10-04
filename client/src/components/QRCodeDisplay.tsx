import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  position?: "corner" | "center";
}

export default function QRCodeDisplay({ url, size = 200, position = "corner" }: QRCodeDisplayProps) {
  if (position === "corner") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="p-4">
          <div className="text-center space-y-3">
            <QRCodeSVG 
              value={url} 
              size={size}
              level="M"
              includeMargin={false}
            />
            <p className="text-sm font-medium">Scan to Request</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Request a Song</h3>
        <QRCodeSVG 
          value={url} 
          size={size}
          level="M"
          includeMargin={false}
          className="mx-auto"
        />
        <p className="text-muted-foreground">Scan with your phone to browse and request songs</p>
      </div>
    </Card>
  );
}
