
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => (
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-10 w-40" />
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
    </div>
  </div>
);

export const TimelineSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>
    ))}
  </div>
);

export const InsightsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
