
import LogCard from '@/components/LogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogEntry } from '@/types';

interface TimelineProps {
    logs: LogEntry[] | undefined;
    isLoading: boolean;
    isError: boolean;
}

const Timeline = ({ logs, isLoading, isError }: TimelineProps) => {
    return (
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Child's Timeline</h2>
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            {isError && (
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Could not load the timeline. Please try again later.</CardDescription>
                    </CardHeader>
                </Card>
            )}
            {logs?.map(log => (
                <LogCard key={log.id} log={log} />
            ))}
             {!isLoading && logs && logs.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>No Logs Yet</CardTitle>
                        <CardDescription>Start by adding a log to the timeline.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
};

export default Timeline;
