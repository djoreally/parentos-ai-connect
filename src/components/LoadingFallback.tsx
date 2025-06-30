import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  showSkeleton?: boolean;
}

const LoadingFallback = ({ 
  message = "Loading...", 
  showSkeleton = false 
}: LoadingFallbackProps) => {
  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-background border-b">
          <Skeleton className="h-full w-full" />
        </div>
        <main className="container mx-auto px-4 md:px-8 pb-12">
          <div className="space-y-8 pt-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your content</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;