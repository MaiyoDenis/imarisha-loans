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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useRef, useCallback } from 'react';
var DEFAULT_CONSTRAINTS = {
    video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    },
    audio: false
};
export function useCamera() {
    var _this = this;
    var _a = useState(null), stream = _a[0], setStream = _a[1];
    var _b = useState(false), isActive = _b[0], setIsActive = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(null), capabilities = _d[0], setCapabilities = _d[1];
    var _e = useState('environment'), facingMode = _e[0], setFacingMode = _e[1];
    var _f = useState(1), zoomLevel = _f[0], setZoomLevel = _f[1];
    var _g = useState(false), hasFlash = _g[0], setHasFlash = _g[1];
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var startCamera = useCallback(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (constraints) {
            var mediaStream, videoTrack, caps, err_1, errorMessage;
            if (constraints === void 0) { constraints = DEFAULT_CONSTRAINTS; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        setError(null);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 1:
                        mediaStream = _a.sent();
                        setStream(mediaStream);
                        setIsActive(true);
                        if (!videoRef.current) return [3 /*break*/, 3];
                        videoRef.current.srcObject = mediaStream;
                        return [4 /*yield*/, videoRef.current.play()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        videoTrack = mediaStream.getVideoTracks()[0];
                        if (videoTrack) {
                            caps = videoTrack.getCapabilities();
                            setCapabilities(caps);
                            // Check for flash/torch support
                            setHasFlash('torch' in caps || 'flash' in caps);
                        }
                        console.log('[Camera] Started with constraints:', constraints);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : 'Failed to access camera';
                        setError(errorMessage);
                        console.error('[Camera] Start failed:', err_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }, []);
    var stopCamera = useCallback(function () {
        if (stream) {
            stream.getTracks().forEach(function (track) { return track.stop(); });
            setStream(null);
        }
        setIsActive(false);
        setCapabilities(null);
        setHasFlash(false);
        setZoomLevel(1);
        console.log('[Camera] Stopped');
    }, [stream]);
    var takePhoto = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var video, canvas, context, imageData;
        return __generator(this, function (_a) {
            if (!videoRef.current || !canvasRef.current || !isActive) {
                return [2 /*return*/, null];
            }
            video = videoRef.current;
            canvas = canvasRef.current;
            context = canvas.getContext('2d');
            if (!context)
                return [2 /*return*/, null];
            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageData = canvas.toDataURL('image/jpeg', 0.9);
            console.log('[Camera] Photo captured');
            return [2 /*return*/, imageData];
        });
    }); }, [isActive]);
    var switchCamera = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var newFacingMode;
        return __generator(this, function (_a) {
            if (!(capabilities === null || capabilities === void 0 ? void 0 : capabilities.facingMode) || typeof capabilities.facingMode === 'boolean') {
                return [2 /*return*/];
            }
            newFacingMode = facingMode === 'user' ? 'environment' : 'user';
            setFacingMode(newFacingMode);
            // Stop current stream
            stopCamera();
            // Start with new facing mode
            setTimeout(function () {
                startCamera(__assign(__assign({}, DEFAULT_CONSTRAINTS), { video: __assign(__assign({}, DEFAULT_CONSTRAINTS.video), { facingMode: newFacingMode }) }));
            }, 100);
            console.log('[Camera] Switched to', newFacingMode, 'camera');
            return [2 /*return*/];
        });
    }); }, [capabilities, facingMode, stopCamera, startCamera]);
    var zoom = useCallback(function (level) {
        if (!stream || !(capabilities === null || capabilities === void 0 ? void 0 : capabilities.zoom))
            return;
        var videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && 'zoom' in capabilities) {
            var zoomCaps = capabilities.zoom;
            var clampedLevel_1 = Math.max(zoomCaps.min, Math.min(zoomCaps.max, level));
            videoTrack.applyConstraints({
                advanced: [{ zoom: clampedLevel_1 }]
            }).then(function () {
                setZoomLevel(clampedLevel_1);
                console.log('[Camera] Zoom set to', clampedLevel_1);
            }).catch(function (err) {
                console.error('[Camera] Zoom failed:', err);
            });
        }
    }, [stream, capabilities]);
    var toggleFlash = useCallback(function () {
        if (!stream || !hasFlash)
            return;
        var videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            var currentTorch = videoTrack.getSettings().torch;
            var newTorch = !currentTorch;
            videoTrack.applyConstraints({
                advanced: [{ torch: newTorch }]
            }).catch(function (err) {
                console.error('[Camera] Flash toggle failed:', err);
            });
            console.log('[Camera] Flash', newTorch ? 'enabled' : 'disabled');
        }
    }, [stream, hasFlash]);
    // Cleanup on unmount
    useEffect(function () {
        return function () {
            stopCamera();
        };
    }, [stopCamera]);
    return {
        stream: stream,
        isActive: isActive,
        error: error,
        capabilities: capabilities,
        startCamera: startCamera,
        stopCamera: stopCamera,
        takePhoto: takePhoto,
        switchCamera: switchCamera,
        zoom: zoom,
        toggleFlash: toggleFlash,
        hasFlash: hasFlash,
        zoomLevel: zoomLevel,
        facingMode: facingMode
    };
}
