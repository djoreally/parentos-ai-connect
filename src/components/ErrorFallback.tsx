import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError?: () => void;
  onReset?: () => void;
}

const ErrorFallback = ({ error, errorInfo, resetError, onReset }: ErrorFallbackProps) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (resetError) resetError();
    if (onReset) onReset();
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const copyErrorDetails = () => {
    const errorDetails = `
Error: ${error?.name}: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(errorDetails).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-2xl">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We've encountered an unexpected error. This has been logged and our team will look into it.
        </p>
        
        {error && (
          <Card className="mb-6 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bug className="h-5 w-5" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-1">Error Type:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{error.name}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-1">Message:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all">{error.message}</p>
                </div>
                
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Show Technical Details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    {error.stack && (
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-1">Stack Trace:</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-1">Component Stack:</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyErrorDetails}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Error Details
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
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
          If this problem persists, please contact support with the error details above.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;