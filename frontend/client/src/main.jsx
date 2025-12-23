import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { swManager } from "./lib/sw-registration";
// Register Service Worker for PWA functionality
swManager.register({
    onSuccess: function (registration) {
        console.log('[App] Service Worker registered successfully');
    },
    onUpdate: function (registration) {
        console.log('[App] Service Worker update available');
        // Notify user about update
        window.dispatchEvent(new CustomEvent('pwa-update', {
            detail: { registration: registration }
        }));
    },
    onError: function (error) {
        console.error('[App] Service Worker registration failed:', error);
    }
});
// Handle offline/online status
document.addEventListener('offline', function () {
    console.log('[App] App is now offline');
});
document.addEventListener('online', function () {
    console.log('[App] App is now online');
});
createRoot(document.getElementById("root")).render(<App />);
