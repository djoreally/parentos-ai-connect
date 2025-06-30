import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

const NetworkErrorHandler = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetry, setShowRetry] = useState(false);
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRetry(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRetry(false);
      setHasAttemptedReconnect(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status immediately
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodically check connection if offline
  useEffect(() => {
    let intervalId: number;
    
    if (!isOnline && !hasAttemptedReconnect) {
      intervalId = window.setInterval(() => {
        checkConnection();
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline, hasAttemptedReconnect]);

  const checkConnection = async () => {
    try {
      // Try to fetch a small resource to check real connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok && !isOnline) {
        // We have connectivity but browser thinks we're offline
        setIsOnline(true);
        setShowRetry(true);
        setHasAttemptedReconnect(true);
      }
    } catch (error) {
      // Failed to connect, we're definitely offline
      if (isOnline) {
        setIsOnline(false);
        setShowRetry(false);
      }
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline && !showRetry) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {!isOnline 
              ? "You're offline. Please check your internet connection." 
              : "Connection restored. Click retry to reload the page."}
          </span>
          {showRetry && (
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NetworkErrorHandler;