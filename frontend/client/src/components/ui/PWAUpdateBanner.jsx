import React from 'react';
import { Button } from './button';
import { X, Download } from 'lucide-react';
import { usePWAUpdates } from '../../hooks/use-pwa-updates';
export function PWAUpdateBanner(_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = usePWAUpdates(), updateAvailable = _c.updateAvailable, update = _c.update, dismiss = _c.dismiss;
    if (!updateAvailable)
        return null;
    return (<div className={"fixed bottom-4 left-4 right-4 z-50 bg-primary text-white p-4 rounded-lg shadow-lg border border-blue-700 md:left-auto md:right-4 md:max-w-sm ".concat(className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Download className="w-5 h-5 mr-2"/>
            <h3 className="font-semibold text-sm">Update Available</h3>
          </div>
          <p className="text-sm text-blue-100 mb-3">
            A new version of the app is available. Update now for the latest features and improvements.
          </p>
          <div className="flex space-x-2">
            <Button onClick={update} size="sm" className="bg-card text-primary hover:bg-primary/10">
              Update Now
            </Button>
            <Button onClick={dismiss} variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-primary/80">
              Later
            </Button>
          </div>
        </div>
        <button onClick={dismiss} className="ml-2 p-1 rounded hover:bg-primary/80 transition-colors" aria-label="Dismiss update">
          <X className="w-4 h-4"/>
        </button>
      </div>
    </div>);
}
