import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storage } from '../utils/storage'
import { AppData } from '../types/task'
import QRCodeExport from './qr-code-export'
import QRCodeImport from './qr-code-import'

export default function Profile() {
  const [appData, setAppData] = useState<AppData>(storage.getData())
  const [newPassword, setNewPassword] = useState('')
  const [importData, setImportData] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [isQRExportOpen, setIsQRExportOpen] = useState(false)
  const [isQRImportOpen, setIsQRImportOpen] = useState(false)

  const handleEncryptionToggle = () => {
    if (!appData.user.encryptionEnabled && !newPassword) {
      alert('Please set a password to enable encryption');
      return;
    }

    const updatedAppData = {
      ...appData,
      user: {
        ...appData.user,
        encryptionEnabled: !appData.user.encryptionEnabled,
        password: !appData.user.encryptionEnabled ? newPassword : undefined
      }
    };

    if (!appData.user.encryptionEnabled) {
      storage.setData(storage.encryptData(updatedAppData, newPassword));
    } else {
      storage.setData(updatedAppData);
    }

    setAppData(updatedAppData);
    setNewPassword('');
  }

  const handleExport = () => {
    const dataStr = storage.exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'task_management_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  const handleImport = () => {
    if (importData) {
      const success = storage.importData(importData, importPassword);
      if (success) {
        setAppData(storage.getData());
        setImportData('');
        setImportPassword('');
        alert('Data imported successfully');
      } else {
        alert('Import failed. Please check your data and password.');
      }
    }
  }

  const handleImportSuccess = () => {
    setAppData(storage.getData());
    alert('Data imported successfully via QR code');
    setIsQRImportOpen(false);
  };

  const handleImportError = (error: string) => {
    alert(`Import failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Encryption Settings</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="encryption"
            checked={appData.user.encryptionEnabled}
            onCheckedChange={handleEncryptionToggle}
          />
          <label htmlFor="encryption">Enable encryption for all tasks</label>
        </div>
        {!appData.user.encryptionEnabled && (
          <Input
            type="password"
            placeholder="Set a new password for encryption"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Data Management</h2>
        <div className="flex space-x-4">
          <Button onClick={handleExport}>Export Data (File)</Button>
          <Button onClick={() => setIsQRExportOpen(true)}>Export Data (QR Code)</Button>
        </div>
        <div className="space-y-2">
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
          {appData.user.encryptionEnabled && (
            <Input
              type="password"
              placeholder="Enter password for encrypted data"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
            />
          )}
          <div className="flex space-x-4">
            <Button onClick={handleImport}>Import Data (File)</Button>
            <Button onClick={() => setIsQRImportOpen(true)}>Import Data (QR Code)</Button>
          </div>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          Your data is stored locally in your browser. We do not collect or store any of your information. 
          Please do not clear your browser cache or local storage, as this will result in data loss.
        </AlertDescription>
      </Alert>

      <QRCodeExport
        appData={appData}
        isOpen={isQRExportOpen}
        onClose={() => setIsQRExportOpen(false)}
      />

      <QRCodeImport
        isOpen={isQRImportOpen}
        onClose={() => setIsQRImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        onImportError={handleImportError}
      />
    </div>
  )
}

