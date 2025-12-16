import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { swManager } from "./lib/sw-registration";

// Register Service Worker for PWA functionality
swManager.register({
  onSuccess: (registration) => {
    console.log('[App] Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('[App] Service Worker update available');
    // Notify user about update
    window.dispatchEvent(
      new CustomEvent('pwa-update', {
        detail: { registration }
      })
    );
  },
  onError: (error) => {
    console.error('[App] Service Worker registration failed:', error);
  }
});

// Handle offline/online status
document.addEventListener('offline', () => {
  console.log('[App] App is now offline');
});

document.addEventListener('online', () => {
  console.log('[App] App is now online');
});

createRoot(document.getElementById("root")!).render(<App />);
