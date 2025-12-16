import { useState, useEffect, useCallback } from 'react';
import { swManager } from '@/lib/sw-registration';

interface SyncRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
  retries: number;
}

interface SyncStatus {
  isOnline: boolean;
  queuedRequests: number;
  isSyncing: boolean;
  lastSyncTime?: number;
  error?: string;
}

const SYNC_DB_NAME = 'imarisha-sync';
const SYNC_STORE_NAME = 'sync-queue';

class OfflineSyncManager {
  private db: IDBDatabase | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYNC_DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
          const store = db.createObjectStore(SYNC_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }
      };
    });
  }

  async addRequest(
    url: string,
    method: string,
    body?: any
  ): Promise<SyncRequest> {
    const db = await this.initDB();
    
    const request: SyncRequest = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      method,
      body,
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SYNC_STORE_NAME);
      const addRequest = store.add(request);

      addRequest.onerror = () => reject(addRequest.error);
      addRequest.onsuccess = () => {
        this.notifyListeners();
        resolve(request);
      };
    });
  }

  async getQueuedRequests(): Promise<SyncRequest[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_STORE_NAME, 'readonly');
      const store = tx.objectStore(SYNC_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeRequest(id: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SYNC_STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
    });
  }

  async syncRequests(): Promise<number> {
    if (!navigator.onLine) {
      console.log('[OfflineSync] Device is offline, cannot sync');
      return 0;
    }

    const queuedRequests = await this.getQueuedRequests();
    let syncedCount = 0;

    for (const req of queuedRequests) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: req.body ? JSON.stringify(req.body) : undefined
        });

        if (response.ok) {
          await this.removeRequest(req.id);
          syncedCount++;
          console.log(`[OfflineSync] Synced: ${req.method} ${req.url}`);
        } else {
          req.retries++;
          if (req.retries > 3) {
            await this.removeRequest(req.id);
            console.warn(`[OfflineSync] Max retries exceeded for ${req.url}`);
          }
        }
      } catch (error) {
        req.retries++;
        if (req.retries <= 3) {
          console.error(`[OfflineSync] Sync failed: ${req.url}`, error);
        }
      }
    }

    this.notifyListeners();
    return syncedCount;
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  private getStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      queuedRequests: 0,
      isSyncing: false,
      lastSyncTime: undefined
    };
  }
}

export const offlineSyncManager = new OfflineSyncManager();

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    queuedRequests: 0,
    isSyncing: false
  });

  useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe(setStatus);

    window.addEventListener('online', async () => {
      await offlineSyncManager.syncRequests();
    });

    return unsubscribe;
  }, []);

  const queueRequest = useCallback(
    async (url: string, method: string, body?: any) => {
      if (navigator.onLine) {
        try {
          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
          });
          return response;
        } catch (error) {
          console.error('[useOfflineSync] Request failed, queueing:', error);
          await offlineSyncManager.addRequest(url, method, body);
          throw error;
        }
      } else {
        await offlineSyncManager.addRequest(url, method, body);
        throw new Error('Device is offline');
      }
    },
    []
  );

  const syncNow = useCallback(async () => {
    const synced = await offlineSyncManager.syncRequests();
    console.log(`[useOfflineSync] Synced ${synced} requests`);
    return synced;
  }, []);

  return {
    ...status,
    queueRequest,
    syncNow
  };
}
