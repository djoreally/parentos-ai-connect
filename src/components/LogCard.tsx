import { LogEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, School, Stethoscope, ArrowDown, Mic, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface LogCardProps {
  log: LogEntry;
}

const authorIcons: Record<LogEntry['author'], React.ReactNode> = {
  Parent: <User className="h-5 w-5 text-gray-500" />,
  Teacher: <School className="h-5 w-5 text-gray-500" />,
  Doctor: <Stethoscope className="h-5 w-5 text-gray-500" />,
};

const typeIcons: Record<LogEntry['type'], React.ReactNode> = {
  text: <ArrowDown className="h-4 w-4" />,
  voice: <Mic className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
};

const LogCard = ({ log }: LogCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="flex flex-row items-start bg-muted/50 justify-between space-y-0 pb-3">
        <div className="space-y-1.5">
          <CardTitle className="text-lg" dangerouslySetInnerHTML={{ __html: log.original_entry.title }} />
          <div className="flex items-center text-sm text-muted-foreground space-x-2 flex-wrap">
            {authorIcons[log.author]}
            <span>Logged by {log.author}</span>
            <span>&bull;</span>
            {typeIcons[log.type]}
            <span className="capitalize">{log.type} Note</span>
            <span>&bull;</span>
            <span>{timeAgo}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {log.tags && log.tags.map(tag => (
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
            {log.audio_url && log.type === 'voice' && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Original Recording:</p>
                <audio controls src={log.audio_url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {log.audio_url && log.type === 'document' && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Attached Document:</p>
                <Button variant="outline" asChild>
                  <a href={log.audio_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </a>
                </Button>
              </div>
            )}
            <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.original_entry.description }} />
          </TabsContent>
          <TabsContent value="teacher" className="p-6 text-sm bg-secondary/10">
            <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.summary_for_teacher }} />
          </TabsContent>
          <TabsContent value="doctor" className="p-6 text-sm bg-blue-50">
            <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.summary_for_doctor }} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogCard;
