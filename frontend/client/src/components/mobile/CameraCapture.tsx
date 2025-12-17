import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture?: (blob: Blob) => void;
  onError?: (error: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to access camera';
      onError?.(message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(blob => {
          if (blob) onCapture?.(blob);
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {isActive ? (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
          <canvas ref={canvasRef} className="hidden" />
          <button onClick={stopCamera} className="btn btn-destructive w-full">
            Stop Camera
          </button>
          <button onClick={takePhoto} className="btn btn-primary w-full">
            Take Photo
          </button>
        </>
      ) : (
        <button onClick={startCamera} className="btn btn-primary w-full">
          Start Camera
        </button>
      )}
    </div>
  );
};
