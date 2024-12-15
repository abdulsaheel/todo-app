import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppData } from '../types/task';
import { generateQRData } from '../utils/qrcode';

interface QRCodeExportProps {
  appData: AppData;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeExport({ appData, isOpen, onClose }: QRCodeExportProps) {
  const [qrData, setQRData] = useState<string>('');

  const handleExport = () => {
    const data = generateQRData(appData, appData.user.encryptionEnabled ? appData.user.password : undefined);
    setQRData(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data via QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Button onClick={handleExport}>Generate QR Code</Button>
          {qrData && (
            <div className="border p-4 rounded-lg">
              <QRCodeSVG value={qrData} size={256} />
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with another device running this app to import your data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

