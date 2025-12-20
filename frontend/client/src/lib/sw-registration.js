var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ServiceWorkerManager = /** @class */ (function () {
    function ServiceWorkerManager() {
        this.registration = null;
        this.isUpdating = false;
    }
    ServiceWorkerManager.prototype.register = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var registration_1, error_1, err;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('serviceWorker' in navigator)) {
                            console.warn('[SW] Service Workers not supported');
                            return [2 /*return*/];
                        }
                        // Skip service worker registration in development to avoid stale bundles
                        if (import.meta && import.meta.env && import.meta.env.DEV) {
                            console.warn('[SW] Skipping registration in development');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.serviceWorker.register('/service-worker.js', { scope: '/' })];
                    case 2:
                        registration_1 = _a.sent();
                        this.registration = registration_1;
                        console.log('[SW] Registration successful:', registration_1);
                        if (options.onSuccess) {
                            options.onSuccess(registration_1);
                        }
                        registration_1.addEventListener('updatefound', function () {
                            _this.handleUpdateFound(registration_1, options);
                        });
                        // Check for updates periodically
                        setInterval(function () {
                            registration_1.update().catch(function (error) {
                                console.error('[SW] Update check error:', error);
                            });
                        }, 60000); // Check every minute
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        err = error_1 instanceof Error ? error_1 : new Error(String(error_1));
                        console.error('[SW] Registration failed:', err);
                        if (options.onError) {
                            options.onError(err);
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ServiceWorkerManager.prototype.handleUpdateFound = function (registration, options) {
        var _this = this;
        var newWorker = registration.installing;
        if (!newWorker)
            return;
        newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                _this.isUpdating = true;
                console.log('[SW] New version available');
                if (options.onUpdate) {
                    options.onUpdate(registration);
                }
                newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    };
    ServiceWorkerManager.prototype.unregister = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success, cacheNames, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.registration)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.registration.unregister()];
                    case 2:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 5];
                        this.registration = null;
                        console.log('[SW] Unregistered successfully');
                        return [4 /*yield*/, caches.keys()];
                    case 3:
                        cacheNames = _a.sent();
                        return [4 /*yield*/, Promise.all(cacheNames.map(function (name) { return caches.delete(name); }))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error('[SW] Unregistration failed:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ServiceWorkerManager.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cacheNames;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((_a = this.registration) === null || _a === void 0 ? void 0 : _a.active) {
                            this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
                        }
                        return [4 /*yield*/, caches.keys()];
                    case 1:
                        cacheNames = _b.sent();
                        return [4 /*yield*/, Promise.all(cacheNames.map(function (name) { return caches.delete(name); }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceWorkerManager.prototype.forceUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.registration) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.registration.update()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ServiceWorkerManager.prototype.getRegistration = function () {
        return this.registration;
    };
    ServiceWorkerManager.prototype.isOnline = function () {
        return navigator.onLine;
    };
    return ServiceWorkerManager;
}());
export var swManager = new ServiceWorkerManager();
// Handle controller change (when new SW activates)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        console.log('[SW] Controller changed - new Service Worker activated');
        // Show notification to user about update
        window.dispatchEvent(new CustomEvent('swupdate', {
            detail: { type: 'controller_change' }
        }));
    });
    // Handle messages from Service Worker
    navigator.serviceWorker.addEventListener('message', function (event) {
        var _a;
        console.log('[SW] Message from Service Worker:', event.data);
        if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) === 'SYNC_COMPLETE') {
            window.dispatchEvent(new CustomEvent('sync-complete', {
                detail: event.data
            }));
        }
    });
}
// Handle online/offline events
window.addEventListener('online', function () {
    console.log('[SW] App is online - syncing queued requests');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC' });
        if ('SyncManager' in window) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.sync.register('sync-requests').catch(function (error) {
                    console.error('[SW] Sync registration failed:', error);
                });
            });
        }
    }
});
window.addEventListener('offline', function () {
    console.log('[SW] App is offline');
    window.dispatchEvent(new CustomEvent('offline', {
        detail: { timestamp: Date.now() }
    }));
});
