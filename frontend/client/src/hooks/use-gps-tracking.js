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
import { useState, useEffect, useCallback, useRef } from 'react';
var DEFAULT_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
};
export function useGPSTracking() {
    var _a = useState(null), position = _a[0], setPosition = _a[1];
    var _b = useState(false), isTracking = _b[0], setIsTracking = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState('low'), accuracy = _d[0], setAccuracy = _d[1];
    var watchIdRef = useRef(null);
    var updateAccuracy = useCallback(function (accuracyValue) {
        if (accuracyValue <= 10) {
            setAccuracy('high');
        }
        else if (accuracyValue <= 50) {
            setAccuracy('medium');
        }
        else {
            setAccuracy('low');
        }
    }, []);
    var handlePositionSuccess = useCallback(function (pos) {
        var newPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || undefined,
            altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
            timestamp: pos.timestamp
        };
        setPosition(newPosition);
        updateAccuracy(pos.coords.accuracy);
        setError(null);
        console.log('[GPS Tracking] Position updated:', {
            lat: newPosition.latitude.toFixed(6),
            lng: newPosition.longitude.toFixed(6),
            accuracy: "".concat(newPosition.accuracy.toFixed(1), "m"),
            accuracyLevel: accuracy
        });
    }, [accuracy, updateAccuracy]);
    var handlePositionError = useCallback(function (err) {
        var errorMessage = 'Unknown GPS error';
        switch (err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = 'GPS access denied. Please enable location permissions.';
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = 'GPS position unavailable. Check your GPS settings.';
                break;
            case err.TIMEOUT:
                errorMessage = 'GPS request timed out. Try again.';
                break;
        }
        setError(errorMessage);
        console.error('[GPS Tracking] Error:', errorMessage);
    }, []);
    var startTracking = useCallback(function (options) {
        if (options === void 0) { options = {}; }
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return;
        }
        var trackingOptions = __assign(__assign({}, DEFAULT_OPTIONS), options);
        setIsTracking(true);
        setError(null);
        // Get initial position
        navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, trackingOptions);
        // Start watching position
        var watchId = navigator.geolocation.watchPosition(handlePositionSuccess, handlePositionError, trackingOptions);
        watchIdRef.current = watchId;
        console.log('[GPS Tracking] Started tracking with options:', trackingOptions);
    }, [handlePositionSuccess, handlePositionError]);
    var stopTracking = useCallback(function () {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        console.log('[GPS Tracking] Stopped tracking');
    }, []);
    var getCurrentPosition = useCallback(function () {
        return new Promise(function (resolve, reject) {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(function (pos) {
                var position = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    altitude: pos.coords.altitude || undefined,
                    altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
                    heading: pos.coords.heading || undefined,
                    speed: pos.coords.speed || undefined,
                    timestamp: pos.timestamp
                };
                resolve(position);
            }, function (err) {
                var errorMessage = 'Failed to get current position';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Position unavailable';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Position request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            }, DEFAULT_OPTIONS);
        });
    }, []);
    // Cleanup on unmount
    useEffect(function () {
        return function () {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);
    return {
        position: position,
        isTracking: isTracking,
        error: error,
        accuracy: accuracy,
        startTracking: startTracking,
        stopTracking: stopTracking,
        getCurrentPosition: getCurrentPosition,
        watchId: watchIdRef.current
    };
}
