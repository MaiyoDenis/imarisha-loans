import React from 'react';
import { Button } from './button';
import { X, Download } from 'lucide-react';
import { usePWAUpdates } from '../../hooks/use-pwa-updates';

interface PWAUpdateBannerProps {
  className?: string;
}

export function PWAUpdateBanner({ className = '' }: PWAUpdateBannerProps) {
  const { updateAvailable, update, dismiss } = usePWAUpdates();

  if (!updateAvailable) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-700 md:left-auto md:right-4 md:max-w-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Download className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-sm">Update Available</h3>
          </div>
          <p className="text-sm text-blue-100 mb-3">
            A new version of the app is available. Update now for the latest features and improvements.
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={update}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Update Now
            </Button>
            <Button
              onClick={dismiss}
              variant="ghost"
              size="sm"
              className="text-blue-100 hover:text-white hover:bg-blue-700"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="ml-2 p-1 rounded hover:bg-blue-700 transition-colors"
          aria-label="Dismiss update"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
