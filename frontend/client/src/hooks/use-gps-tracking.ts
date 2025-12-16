import { useState, useEffect, useCallback, useRef } from 'react';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface GPSTrackingState {
  position: GPSPosition | null;
  isTracking: boolean;
  error: string | null;
  accuracy: 'high' | 'medium' | 'low';
  startTracking: (options?: PositionOptions) => void;
  stopTracking: () => void;
  getCurrentPosition: () => Promise<GPSPosition>;
  watchId: number | null;
}

interface PositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000
};

export function useGPSTracking(): GPSTrackingState {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<'high' | 'medium' | 'low'>('low');
  const watchIdRef = useRef<number | null>(null);

  const updateAccuracy = useCallback((accuracyValue: number) => {
    if (accuracyValue <= 10) {
      setAccuracy('high');
    } else if (accuracyValue <= 50) {
      setAccuracy('medium');
    } else {
      setAccuracy('low');
    }
  }, []);

  const handlePositionSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition: GPSPosition = {
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
      accuracy: `${newPosition.accuracy.toFixed(1)}m`,
      accuracyLevel: accuracy
    });
  }, [accuracy, updateAccuracy]);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Unknown GPS error';

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

  const startTracking = useCallback((options: PositionOptions = {}) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    const trackingOptions = { ...DEFAULT_OPTIONS, ...options };
    setIsTracking(true);
    setError(null);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      trackingOptions
    );

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      trackingOptions
    );

    watchIdRef.current = watchId;
    console.log('[GPS Tracking] Started tracking with options:', trackingOptions);
  }, [handlePositionSuccess, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    console.log('[GPS Tracking] Stopped tracking');
  }, []);

  const getCurrentPosition = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: GPSPosition = {
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
        },
        (err) => {
          let errorMessage = 'Failed to get current position';
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
        },
        DEFAULT_OPTIONS
      );
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    isTracking,
    error,
    accuracy,
    startTracking,
    stopTracking,
    getCurrentPosition,
    watchId: watchIdRef.current
  };
}
