import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGPSTracking } from '@/hooks/use-gps-tracking';
import { MapPin, Play, Square, Navigation } from 'lucide-react';

interface GPSTrackerProps {
  autoStart?: boolean;
  showControls?: boolean;
  className?: string;
}

export function GPSTracker({ autoStart = false, showControls = false, className = '' }: GPSTrackerProps) {
  const {
    position,
    isTracking,
    error,
    accuracy,
    startTracking,
    stopTracking,
    getCurrentPosition
  } = useGPSTracking();

  useEffect(() => {
    if (autoStart && !isTracking) {
      startTracking();
    }
  }, [autoStart, isTracking, startTracking]);

  const handleGetCurrentPosition = async () => {
    try {
      await getCurrentPosition();
    } catch (err) {
      console.error('Failed to get current position:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          GPS Location Tracking
        </CardTitle>
        <CardDescription>
          Real-time GPS tracking for field operations with accuracy monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Tracking Status</div>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Accuracy</div>
            <Badge variant={
              accuracy === 'high' ? 'default' :
              accuracy === 'medium' ? 'secondary' : 'destructive'
            }>
              {accuracy.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Position Display */}
        {position && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Position</div>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              <div>Lat: {position.latitude.toFixed(6)}</div>
              <div>Lng: {position.longitude.toFixed(6)}</div>
              <div>Accuracy: ±{position.accuracy.toFixed(1)}m</div>
              {position.altitude && (
                <div>Altitude: {position.altitude.toFixed(1)}m</div>
              )}
              {position.speed && (
                <div>Speed: {(position.speed * 3.6).toFixed(1)} km/h</div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex gap-2">
            <Button
              onClick={isTracking ? stopTracking : startTracking}
              variant={isTracking ? "destructive" : "default"}
              className="flex-1"
            >
              {isTracking ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Tracking
                </>
              )}
            </Button>
            <Button onClick={handleGetCurrentPosition} variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Get Position
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          GPS tracking requires location permissions. Ensure GPS is enabled on your device for best accuracy.
        </div>
      </CardContent>
    </Card>
  );
}
