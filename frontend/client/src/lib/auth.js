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
import { useEffect, useState } from 'react';
var API_BASE = import.meta.env.VITE_API_URL || "https://imarisha-loans.onrender.com/api";
export function useAuth() {
    var _this = this;
    var _a = useState(null), user = _a[0], setUser = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(false), isAuthenticated = _c[0], setIsAuthenticated = _c[1];
    useEffect(function () {
        var initAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var token, storedUser;
            return __generator(this, function (_a) {
                try {
                    token = localStorage.getItem('auth_token');
                    if (token) {
                        storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            setUser(JSON.parse(storedUser));
                            setIsAuthenticated(true);
                        }
                    }
                }
                catch (error) {
                    console.error('Auth initialization error:', error);
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        initAuth();
    }, []);
    var login = function (username, password) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/auth/login"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username, password: password }),
                            credentials: 'include',
                        })];
                case 2:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: 'Login failed' }); })];
                case 3:
                    errorData = _c.sent();
                    throw new Error(errorData.error || 'Login failed');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _c.sent();
                    setUser(data.user || { username: username, email: username });
                    setIsAuthenticated(true);
                    localStorage.setItem('auth_token', data.access_token || ((_a = data.tokens) === null || _a === void 0 ? void 0 : _a.access_token));
                    localStorage.setItem('refresh_token', data.refresh_token || ((_b = data.tokens) === null || _b === void 0 ? void 0 : _b.refresh_token) || '');
                    localStorage.setItem('user', JSON.stringify(data.user || { username: username, email: username }));
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _c.sent();
                    console.error('Login error:', error_1);
                    throw error_1;
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/auth/logout"), { method: 'POST' })];
                case 2:
                    _a.sent();
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Logout error:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var register = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, result, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/auth/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                            credentials: 'include',
                        })];
                case 2:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: 'Registration failed' }); })];
                case 3:
                    errorData = _c.sent();
                    throw new Error(errorData.error || 'Registration failed');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _c.sent();
                    setUser(result.user || data);
                    setIsAuthenticated(true);
                    localStorage.setItem('auth_token', result.access_token || ((_a = result.tokens) === null || _a === void 0 ? void 0 : _a.access_token));
                    localStorage.setItem('refresh_token', result.refresh_token || ((_b = result.tokens) === null || _b === void 0 ? void 0 : _b.refresh_token) || '');
                    localStorage.setItem('user', JSON.stringify(result.user || data));
                    return [3 /*break*/, 8];
                case 6:
                    error_3 = _c.sent();
                    console.error('Registration error:', error_3);
                    throw error_3;
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    return {
        user: user,
        isLoading: isLoading,
        isAuthenticated: isAuthenticated,
        login: login,
        logout: logout,
        register: register,
    };
}
export function getAuthToken() {
    return localStorage.getItem('auth_token');
}
export function setAuthToken(token) {
    localStorage.setItem('auth_token', token);
}
export function clearAuthToken() {
    localStorage.removeItem('auth_token');
}
export function isTokenExpired(token) {
    try {
        var parts = token.split('.');
        if (parts.length !== 3)
            return true;
        var payload = JSON.parse(atob(parts[1]));
        return payload.exp * 1000 < Date.now();
    }
    catch (_a) {
        return true;
    }
}
