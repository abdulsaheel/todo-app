import { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseQRData } from '../utils/qrcode';
import { storage } from '../utils/storage';

interface QRCodeImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  onImportError: (error: string) => void;
}

export default function QRCodeImport({ isOpen, onClose, onImportSuccess, onImportError }: QRCodeImportProps) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkCameraPermission();
      setScannedData(null);
      setPassword('');
      setError(null);
      setIsScanning(true);
    }
  }, [isOpen]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error('Camera permission error:', err);
      setHasPermission(false);
      setError('Camera access denied. Please grant permission and try again.');
      onImportError('Camera access denied');
    }
  };

  const handleScan = (data: string | null) => {
    console.log('QR Scan result:', data);
    if (data) {
      setScannedData(data);
      setError(null);
      setIsScanning(false);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scan error:', err);
    setError('Failed to scan QR code. Please try again.');
    onImportError('Failed to scan QR code');
  };

  const handleImport = () => {
    if (!scannedData) return;

    try {
      const appData = parseQRData(scannedData, password);
      storage.setData(appData);
      onImportSuccess();
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import data. Please check your password and try again.');
      onImportError('Failed to import data');
    }
  };

  const resetScan = () => {
    setScannedData(null);
    setPassword('');
    setError(null);
    setIsScanning(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data via QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {hasPermission === false && (
            <Alert variant="destructive">
              <AlertDescription>
                Camera access is required for QR code scanning. Please grant permission in your browser settings and try again.
              </AlertDescription>
            </Alert>
          )}
          {hasPermission && isScanning && (
            <QrScanner
              onScan={handleScan}
              onError={handleError}
              style={{ width: '100%' }}
              constraints={{
                audio: false,
                video: { facingMode: 'environment' }
              }}
            />
          )}
          {scannedData && (
            <>
              <Alert variant="default">
                <AlertDescription>QR Code scanned successfully!</AlertDescription>
              </Alert>
              <Input
                type="password"
                placeholder="Enter password (if required)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Alert>
                <AlertDescription>
                  Importing data will overwrite all your existing tasks and projects. Make sure you have a backup before proceeding.
                </AlertDescription>
              </Alert>
            </>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          {scannedData ? (
            <>
              <Button onClick={resetScan} variant="outline">Scan Again</Button>
              <Button onClick={handleImport}>Import Data</Button>
            </>
          ) : (
            <Button onClick={onClose}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

