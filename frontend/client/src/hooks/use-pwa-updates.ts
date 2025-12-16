import { useState, useEffect } from 'react';

interface PWAUpdateState {
  updateAvailable: boolean;
  update: () => void;
  dismiss: () => void;
}

export function usePWAUpdates(): PWAUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Check for updates periodically
        const checkForUpdates = () => {
          reg.update();
        };

        // Check immediately and then every 30 minutes
        checkForUpdates();
        const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

        return () => clearInterval(interval);
      });
    }
  }, []);

  const update = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      // Reload after a short delay to allow SW to take control
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const dismiss = () => {
    setUpdateAvailable(false);
  };

  return {
    updateAvailable,
    update,
    dismiss
  };
}
