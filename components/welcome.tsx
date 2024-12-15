import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { storage, setSessionKey } from '../utils/storage';
import QRCodeImport from './qr-code-import';

export default function Welcome({ onStart }: { onStart: () => void }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [importData, setImportData] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [isQRImportOpen, setIsQRImportOpen] = useState(false);

  const handleStart = () => {
    if (name) {
      const user = { 
        name, 
        avatar: '/placeholder.svg', 
        encryptionEnabled,
        password: encryptionEnabled ? password : undefined 
      };
      const appData = storage.getData();
      appData.user = user;
      if (encryptionEnabled) {
        setSessionKey(password);
        storage.setData(storage.encryptData(appData, password));
      } else {
        storage.setData(appData);
      }
      onStart();
    }
  };

  const handleImport = () => {
    if (importData) {
      const success = storage.importData(importData, importPassword);
      if (success) {
        alert('Data imported successfully');
        onStart();
      } else {
        alert('Import failed. Please check your data and password.');
      }
    }
  };

  const handleImportSuccess = () => {
    alert('Data imported successfully via QR code');
    onStart();
  };

  const handleImportError = (error: string) => {
    alert(`Import failed: ${error}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="relative h-64 w-64 mx-auto">
          <Image
            src="/placeholder.svg"
            alt="Task Management"
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Task Management & To-Do List
          </h1>
          <p className="text-muted-foreground">
            This productive tool is designed to help you better manage your tasks
            project-wise conveniently!
          </p>
        </div>
        <Alert>
          <AlertDescription>
            Your data is stored locally in your browser. We do not collect or store any of your information. 
            Please do not clear your browser cache or local storage, as this will result in data loss.
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="encryption"
              checked={encryptionEnabled}
              onCheckedChange={(checked) => setEncryptionEnabled(checked as boolean)}
            />
            <label htmlFor="encryption">Enable encryption for all tasks</label>
          </div>
          {encryptionEnabled && (
            <Input
              type="password"
              placeholder="Set a password for encryption"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </div>
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!name || (encryptionEnabled && !password)}
        >
          Let's Start
        </Button>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Import Existing Data</h2>
          <Input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => setImportData(e.target?.result as string);
                reader.readAsText(file);
              }
            }}
          />
          <Input
            type="password"
            placeholder="Enter password for encrypted data (if applicable)"
            value={importPassword}
            onChange={(e) => setImportPassword(e.target.value)}
          />
          <div className="flex space-x-4">
            <Button
              onClick={handleImport}
              size="lg"
              className="w-full"
              disabled={!importData}
            >
              Import Data (File)
            </Button>
            <Button
              onClick={() => setIsQRImportOpen(true)}
              size="lg"
              className="w-full"
            >
              Import Data (QR Code)
            </Button>
          </div>
        </div>
      </div>
      <QRCodeImport
        isOpen={isQRImportOpen}
        onClose={() => setIsQRImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        onImportError={handleImportError}
      />
    </div>
  );
}

