import { Task, Project, User, AppData } from '../types/task';
import { encrypt, decrypt } from './encryption';

const STORAGE_KEY = 'taskManagementAppData';

let sessionKey: string | null = null;
let lastUnlockTime: number | null = null;

const UNLOCK_DURATION = 60000; // 1 minute in milliseconds

export const setSessionKey = (key: string) => {
  sessionKey = key;
  lastUnlockTime = Date.now();
};

export const clearSessionKey = () => {
  sessionKey = null;
  lastUnlockTime = null;
};

export const getSessionKey = () => sessionKey;

export const isSessionValid = () => {
  return lastUnlockTime !== null && (Date.now() - lastUnlockTime < UNLOCK_DURATION);
};

export const updateLastUnlockTime = () => {
  if (sessionKey) {
    lastUnlockTime = Date.now();
  }
};

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        tasks: [],
        projects: [],
        user: {
          name: '', encryptionEnabled: false,
          avatar: ''
        } // Adjusted to match the `User` type
      };
    }

    const parsedData: AppData = JSON.parse(data);
    if (parsedData.user?.encryptionEnabled && sessionKey && isSessionValid()) {
      updateLastUnlockTime();
      return storage.decryptData(parsedData, sessionKey);
    }
    return parsedData;
  },

  setData: (data: AppData) => {
    if (data.user?.encryptionEnabled && sessionKey && isSessionValid()) {
      updateLastUnlockTime();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage.encryptData(data, sessionKey)));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  encryptData: (data: AppData, password: string): AppData => {
    return {
      ...data,
      tasks: data.tasks.map(task => ({
        ...task,
        title: encrypt(task.title, password),
        description: encrypt(task.description, password)
      }))
    };
  },

  decryptData: (data: AppData, password: string): AppData => {
    return {
      ...data,
      tasks: data.tasks.map(task => ({
        ...task,
        title: decrypt(task.title, password),
        description: decrypt(task.description, password)
      }))
    };
  },

  exportData: (): string => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data || '';
  },

  importData: (importedData: string, password?: string) => {
    try {
      const parsedData: AppData = JSON.parse(importedData);
      if (parsedData.user?.encryptionEnabled && !password) {
        throw new Error('Password required for encrypted data');
      }
      if (parsedData.user?.encryptionEnabled) {
        const decryptedData = storage.decryptData(parsedData, password!);
        storage.setData(decryptedData);
      } else {
        storage.setData(parsedData);
      }
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
};
