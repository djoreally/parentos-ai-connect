
import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  onReset?: () => void;
}

const ErrorFallback = ({ error, resetError, onReset }: ErrorFallbackProps) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (resetError) resetError();
    if (onReset) onReset();
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          We've encountered an unexpected error. This has been logged and our team will look into it.
        </p>
        
        {error && (
          <details className="mb-6 p-4 bg-muted rounded-lg text-left">
            <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
            <code className="text-sm break-all">
              {error.name}: {error.message}
            </code>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
