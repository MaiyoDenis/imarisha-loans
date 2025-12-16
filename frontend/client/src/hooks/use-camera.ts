import { useState, useEffect, useRef, useCallback } from 'react';

// Type declarations for Media APIs
declare global {
  interface MediaTrackCapabilities {
    zoom?: { min: number; max: number; step: number };
    torch?: boolean;
    flash?: boolean;
    facingMode?: string[];
  }

  interface MediaStreamConstraints {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
  }
}

interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  capabilities: MediaTrackCapabilities | null;
  startCamera: (constraints?: MediaStreamConstraints) => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => Promise<string | null>;
  switchCamera: () => Promise<void>;
  zoom: (level: number) => void;
  toggleFlash: () => void;
  hasFlash: boolean;
  zoomLevel: number;
  facingMode: 'user' | 'environment';
}

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: 'environment',
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  },
  audio: false
};

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasFlash, setHasFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async (constraints: MediaStreamConstraints = DEFAULT_CONSTRAINTS) => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Get track capabilities
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = videoTrack.getCapabilities();
        setCapabilities(caps);

        // Check for flash/torch support
        setHasFlash('torch' in caps || 'flash' in caps);
      }

      console.log('[Camera] Started with constraints:', constraints);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('[Camera] Start failed:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setCapabilities(null);
    setHasFlash(false);
    setZoomLevel(1);
    console.log('[Camera] Stopped');
  }, [stream]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    console.log('[Camera] Photo captured');
    return imageData;
  }, [isActive]);

  const switchCamera = useCallback(async () => {
    if (!capabilities?.facingMode || typeof capabilities.facingMode === 'boolean') {
      return;
    }

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Stop current stream
    stopCamera();

    // Start with new facing mode
    setTimeout(() => {
      startCamera({
        ...DEFAULT_CONSTRAINTS,
        video: {
          ...DEFAULT_CONSTRAINTS.video,
          facingMode: newFacingMode
        }
      });
    }, 100);

    console.log('[Camera] Switched to', newFacingMode, 'camera');
  }, [capabilities, facingMode, stopCamera, startCamera]);

  const zoom = useCallback((level: number) => {
    if (!stream || !capabilities?.zoom) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && 'zoom' in capabilities) {
      const zoomCaps = capabilities.zoom as { min: number; max: number; step: number };
      const clampedLevel = Math.max(zoomCaps.min, Math.min(zoomCaps.max, level));

      videoTrack.applyConstraints({
        advanced: [{ zoom: clampedLevel } as any]
      }).then(() => {
        setZoomLevel(clampedLevel);
        console.log('[Camera] Zoom set to', clampedLevel);
      }).catch(err => {
        console.error('[Camera] Zoom failed:', err);
      });
    }
  }, [stream, capabilities]);

  const toggleFlash = useCallback(() => {
    if (!stream || !hasFlash) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const currentTorch = videoTrack.getSettings().torch;
      const newTorch = !currentTorch;

      videoTrack.applyConstraints({
        advanced: [{ torch: newTorch } as any]
      }).catch(err => {
        console.error('[Camera] Flash toggle failed:', err);
      });

      console.log('[Camera] Flash', newTorch ? 'enabled' : 'disabled');
    }
  }, [stream, hasFlash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    isActive,
    error,
    capabilities,
    startCamera,
    stopCamera,
    takePhoto,
    switchCamera,
    zoom,
    toggleFlash,
    hasFlash,
    zoomLevel,
    facingMode
  };
}
