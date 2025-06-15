
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AuthLoadingSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] animate-pulse" />
        <Skeleton className="h-4 w-[200px] animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground mt-4">Loading...</p>
    </div>
  </div>
);

export default AuthLoadingSpinner;
