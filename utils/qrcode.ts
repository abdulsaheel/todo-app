import { AppData } from '../types/task';
import { encrypt, decrypt } from './encryption';

export function generateQRData(appData: AppData, password?: string): string {
  const dataString = JSON.stringify(appData);
  const encodedData = btoa(dataString);
  if (password) {
    return encrypt(encodedData, password);
  }
  return encodedData;
}

export function parseQRData(qrData: string, password?: string): AppData {
  let decodedData: string;
  if (password) {
    decodedData = decrypt(qrData, password);
  } else {
    decodedData = qrData;
  }
  const jsonString = atob(decodedData);
  return JSON.parse(jsonString);
}

