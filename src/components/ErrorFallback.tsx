
import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

const ErrorFallback = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong.</h1>
        <p className="text-muted-foreground mb-6">
          We've been notified of the issue and are working to fix it. Please try refreshing the page or clicking the button below.
        </p>
        <Button onClick={onReset}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
