
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditLog } from '@/api/compliance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

const AuditLogTable = () => {
    const { data: logs, isLoading, isError } = useQuery<AuditLog[]>({
        queryKey: ['auditLogs'],
        queryFn: getAuditLogs
    });

    const getActionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (action.includes('FAIL')) return 'destructive';
        if (action.includes('CREATED') || action.includes('GENERATED')) return 'secondary';
        return 'default'; // For SUCCESS and others
    };

    const getUserName = (log: AuditLog) => {
        if (!log.profiles) return log.user_id ? 'User (No Profile)' : 'System/Anonymous';
        const name = `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim();
        return name || 'User (Unnamed)';
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>Recent system events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (isError) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not load audit logs.</p></CardContent></Card>
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>A log of recent system events for compliance and security monitoring.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{format(new Date(log.created_at), 'Pp')}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={getActionVariant(log.action)}
                                            className={log.action.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}
                                        >
                                            {log.action.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{getUserName(log)}</div>
                                        {log.user_id && <div className="text-xs text-muted-foreground">{log.user_id}</div>}
                                    </TableCell>
                                    <TableCell>
                                        {log.target_entity && <div className="font-medium capitalize">{log.target_entity}</div>}
                                        {log.target_id && <div className="text-xs text-muted-foreground">{log.target_id}</div>}
                                    </TableCell>
                                    <TableCell>
                                        {log.details && (
                                            <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto max-w-xs">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AuditLogTable;
