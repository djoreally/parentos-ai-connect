
import LogCard from '@/components/LogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogEntry } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


interface TimelineProps {
    logs: LogEntry[] | undefined;
    isLoading: boolean;
    isError: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Timeline = ({ logs, isLoading, isError, currentPage, totalPages, onPageChange }: TimelineProps) => {
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
            {!isLoading && totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1) onPageChange(currentPage - 1);
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        
                        {/* This logic could be improved for many pages, but is fine for now */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                             <PaginationItem key={page}>
                                <PaginationLink 
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                       
                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default Timeline;
