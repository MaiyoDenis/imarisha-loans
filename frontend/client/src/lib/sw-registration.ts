interface SWRegistrationOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isUpdating = false;

  async register(options: SWRegistrationOptions = {}): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Workers not supported');
      return;
    }

    // Skip service worker registration in development to avoid stale bundles
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      console.warn('[SW] Skipping registration in development');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      this.registration = registration;
      console.log('[SW] Registration successful:', registration);

      if (options.onSuccess) {
        options.onSuccess(registration);
      }

      registration.addEventListener('updatefound', () => {
        this.handleUpdateFound(registration, options);
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update().catch(error => {
          console.error('[SW] Update check error:', error);
        });
      }, 60000); // Check every minute

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[SW] Registration failed:', err);
      
      if (options.onError) {
        options.onError(err);
      }
    }
  }

  private handleUpdateFound(
    registration: ServiceWorkerRegistration,
    options: SWRegistrationOptions
  ): void {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.isUpdating = true;
        console.log('[SW] New version available');

        if (options.onUpdate) {
          options.onUpdate(registration);
        }

        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }

  async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        console.log('[SW] Unregistered successfully');
        
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
    } catch (error) {
      console.error('[SW] Unregistration failed:', error);
    }
  }

  async clearCache(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }

  async forceUpdate(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const swManager = new ServiceWorkerManager();

// Handle controller change (when new SW activates)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Controller changed - new Service Worker activated');
    // Show notification to user about update
    window.dispatchEvent(
      new CustomEvent('swupdate', {
        detail: { type: 'controller_change' }
      })
    );
  });

  // Handle messages from Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW] Message from Service Worker:', event.data);
    
    if (event.data?.type === 'SYNC_COMPLETE') {
      window.dispatchEvent(
        new CustomEvent('sync-complete', {
          detail: event.data
        })
      );
    }
  });
}

// Handle online/offline events
window.addEventListener('online', () => {
  console.log('[SW] App is online - syncing queued requests');
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SYNC' });
    
    if ('SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        (registration as any).sync.register('sync-requests').catch((error: any) => {
          console.error('[SW] Sync registration failed:', error);
        });
      });
    }
  }
});

window.addEventListener('offline', () => {
  console.log('[SW] App is offline');
  window.dispatchEvent(
    new CustomEvent('offline', {
      detail: { timestamp: Date.now() }
    })
  );
});
