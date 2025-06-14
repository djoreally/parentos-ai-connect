
import { LogEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, School, Stethoscope } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogCardProps {
  log: LogEntry;
}

const authorIcons: Record<LogEntry['author'], React.ReactNode> = {
  Parent: <User className="h-5 w-5 text-gray-500" />,
  Teacher: <School className="h-5 w-5 text-gray-500" />,
  Doctor: <Stethoscope className="h-5 w-5 text-gray-500" />,
};

const LogCard = ({ log }: LogCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="flex flex-row items-start bg-muted/50 justify-between space-y-0 pb-3">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">{log.original_entry.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            {authorIcons[log.author]}
            <span>Logged by {log.author}</span>
            <span>&bull;</span>
            <span>{timeAgo}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {log.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="parent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-none border-b">
            <TabsTrigger value="parent"><User className="h-4 w-4 mr-2"/> Parent's View</TabsTrigger>
            <TabsTrigger value="teacher"><School className="h-4 w-4 mr-2"/> For Teacher</TabsTrigger>
            <TabsTrigger value="doctor"><Stethoscope className="h-4 w-4 mr-2"/> For Doctor</TabsTrigger>
          </TabsList>
          <TabsContent value="parent" className="p-6 text-sm">
            <p className="whitespace-pre-wrap">{log.original_entry.description}</p>
          </TabsContent>
          <TabsContent value="teacher" className="p-6 text-sm bg-secondary/10">
            <p className="whitespace-pre-wrap">{log.summary_for_teacher}</p>
          </TabsContent>
          <TabsContent value="doctor" className="p-6 text-sm bg-blue-50">
            <p className="whitespace-pre-wrap">{log.summary_for_doctor}</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogCard;
