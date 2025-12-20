import { useState, useEffect } from 'react';
export function usePWAUpdates() {
    var _a = useState(false), updateAvailable = _a[0], setUpdateAvailable = _a[1];
    var _b = useState(null), registration = _b[0], setRegistration = _b[1];
    useEffect(function () {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function (reg) {
                setRegistration(reg);
                // Listen for updates
                reg.addEventListener('updatefound', function () {
                    var newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', function () {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
                // Check for updates periodically
                var checkForUpdates = function () {
                    reg.update();
                };
                // Check immediately and then every 30 minutes
                checkForUpdates();
                var interval = setInterval(checkForUpdates, 30 * 60 * 1000);
                return function () { return clearInterval(interval); };
            });
        }
    }, []);
    var update = function () {
        if (registration === null || registration === void 0 ? void 0 : registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            setUpdateAvailable(false);
            // Reload after a short delay to allow SW to take control
            setTimeout(function () { return window.location.reload(); }, 100);
        }
    };
    var dismiss = function () {
        setUpdateAvailable(false);
    };
    return {
        updateAvailable: updateAvailable,
        update: update,
        dismiss: dismiss
    };
}
