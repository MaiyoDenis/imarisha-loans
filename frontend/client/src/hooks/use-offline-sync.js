var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState, useEffect, useCallback } from 'react';
var SYNC_DB_NAME = 'imarisha-sync';
var SYNC_STORE_NAME = 'sync-queue';
var OfflineSyncManager = /** @class */ (function () {
    function OfflineSyncManager() {
        this.db = null;
        this.listeners = new Set();
    }
    OfflineSyncManager.prototype.initDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.db)
                    return [2 /*return*/, this.db];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = indexedDB.open(SYNC_DB_NAME, 1);
                        request.onerror = function () { return reject(request.error); };
                        request.onsuccess = function () {
                            _this.db = request.result;
                            resolve(_this.db);
                        };
                        request.onupgradeneeded = function (event) {
                            var db = event.target.result;
                            if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
                                var store = db.createObjectStore(SYNC_STORE_NAME, {
                                    keyPath: 'id',
                                    autoIncrement: true
                                });
                                store.createIndex('timestamp', 'timestamp', { unique: false });
                                store.createIndex('url', 'url', { unique: false });
                            }
                        };
                    })];
            });
        });
    };
    OfflineSyncManager.prototype.addRequest = function (url, method, body) {
        return __awaiter(this, void 0, void 0, function () {
            var db, request;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initDB()];
                    case 1:
                        db = _a.sent();
                        request = {
                            id: "".concat(Date.now(), "-").concat(Math.random()),
                            url: url,
                            method: method,
                            body: body,
                            timestamp: Date.now(),
                            retries: 0
                        };
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
                                var store = tx.objectStore(SYNC_STORE_NAME);
                                var addRequest = store.add(request);
                                addRequest.onerror = function () { return reject(addRequest.error); };
                                addRequest.onsuccess = function () {
                                    _this.notifyListeners();
                                    resolve(request);
                                };
                            })];
                }
            });
        });
    };
    OfflineSyncManager.prototype.getQueuedRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initDB()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = db.transaction(SYNC_STORE_NAME, 'readonly');
                                var store = tx.objectStore(SYNC_STORE_NAME);
                                var request = store.getAll();
                                request.onerror = function () { return reject(request.error); };
                                request.onsuccess = function () { return resolve(request.result); };
                            })];
                }
            });
        });
    };
    OfflineSyncManager.prototype.removeRequest = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initDB()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
                                var store = tx.objectStore(SYNC_STORE_NAME);
                                var request = store.delete(id);
                                request.onerror = function () { return reject(request.error); };
                                request.onsuccess = function () {
                                    _this.notifyListeners();
                                    resolve();
                                };
                            })];
                }
            });
        });
    };
    OfflineSyncManager.prototype.syncRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queuedRequests, syncedCount, _i, queuedRequests_1, req, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!navigator.onLine) {
                            console.log('[OfflineSync] Device is offline, cannot sync');
                            return [2 /*return*/, 0];
                        }
                        return [4 /*yield*/, this.getQueuedRequests()];
                    case 1:
                        queuedRequests = _a.sent();
                        syncedCount = 0;
                        _i = 0, queuedRequests_1 = queuedRequests;
                        _a.label = 2;
                    case 2:
                        if (!(_i < queuedRequests_1.length)) return [3 /*break*/, 11];
                        req = queuedRequests_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, fetch(req.url, {
                                method: req.method,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: req.body ? JSON.stringify(req.body) : undefined
                            })];
                    case 4:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.removeRequest(req.id)];
                    case 5:
                        _a.sent();
                        syncedCount++;
                        console.log("[OfflineSync] Synced: ".concat(req.method, " ").concat(req.url));
                        return [3 /*break*/, 8];
                    case 6:
                        req.retries++;
                        if (!(req.retries > 3)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.removeRequest(req.id)];
                    case 7:
                        _a.sent();
                        console.warn("[OfflineSync] Max retries exceeded for ".concat(req.url));
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        req.retries++;
                        if (req.retries <= 3) {
                            console.error("[OfflineSync] Sync failed: ".concat(req.url), error_1);
                        }
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 2];
                    case 11:
                        this.notifyListeners();
                        return [2 /*return*/, syncedCount];
                }
            });
        });
    };
    OfflineSyncManager.prototype.subscribe = function (listener) {
        var _this = this;
        this.listeners.add(listener);
        listener(this.getStatus());
        return function () {
            _this.listeners.delete(listener);
        };
    };
    OfflineSyncManager.prototype.notifyListeners = function () {
        var status = this.getStatus();
        this.listeners.forEach(function (listener) { return listener(status); });
    };
    OfflineSyncManager.prototype.getStatus = function () {
        return {
            isOnline: navigator.onLine,
            queuedRequests: 0,
            isSyncing: false,
            lastSyncTime: undefined
        };
    };
    return OfflineSyncManager;
}());
export var offlineSyncManager = new OfflineSyncManager();
export function useOfflineSync() {
    var _this = this;
    var _a = useState({
        isOnline: navigator.onLine,
        queuedRequests: 0,
        isSyncing: false
    }), status = _a[0], setStatus = _a[1];
    useEffect(function () {
        var unsubscribe = offlineSyncManager.subscribe(setStatus);
        window.addEventListener('online', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, offlineSyncManager.syncRequests()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return unsubscribe;
    }, []);
    var queueRequest = useCallback(function (url, method, body) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!navigator.onLine) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: body ? JSON.stringify(body) : undefined
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response];
                case 3:
                    error_2 = _a.sent();
                    console.error('[useOfflineSync] Request failed, queueing:', error_2);
                    return [4 /*yield*/, offlineSyncManager.addRequest(url, method, body)];
                case 4:
                    _a.sent();
                    throw error_2;
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, offlineSyncManager.addRequest(url, method, body)];
                case 7:
                    _a.sent();
                    throw new Error('Device is offline');
                case 8: return [2 /*return*/];
            }
        });
    }); }, []);
    var syncNow = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var synced;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, offlineSyncManager.syncRequests()];
                case 1:
                    synced = _a.sent();
                    console.log("[useOfflineSync] Synced ".concat(synced, " requests"));
                    return [2 /*return*/, synced];
            }
        });
    }); }, []);
    return __assign(__assign({}, status), { queueRequest: queueRequest, syncNow: syncNow });
}
