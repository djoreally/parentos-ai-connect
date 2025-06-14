
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry } from "@/types";
import { useMemo } from "react";

type LogHistoryProps = {
  logs: LogEntry[];
};

const LogCategory = ({ title, logs }: { title: string; logs: LogEntry[] }) => {
  if (logs.length === 0) return null;

  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-lg">{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border rounded-md bg-muted/20">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                  <p className="font-semibold">{log.original_entry.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()} by {log.author}
                  </p>
                </div>
                 <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                    {log.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </div>
              <p className="text-muted-foreground">{log.original_entry.description}</p>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};


const LogHistory = ({ logs }: LogHistoryProps) => {
  const { healthLogs, educationLogs, generalLogs } = useMemo(() => {
    const healthTags = ['anxiety', 'sleep', 'health'];
    const educationTags = ['school', 'social', 'focus'];

    const healthLogs = logs.filter(log => log.tags?.some(tag => healthTags.includes(tag)));
    const educationLogs = logs.filter(log => {
      const hasEducationTag = log.tags?.some(tag => educationTags.includes(tag));
      const hasHealthTag = log.tags?.some(tag => healthTags.includes(tag));
      return hasEducationTag && !hasHealthTag;
    });
    const generalLogs = logs.filter(log => !healthLogs.find(l => l.id === log.id) && !educationLogs.find(l => l.id === log.id));

    return { healthLogs, educationLogs, generalLogs };
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log History</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["Health"]} className="w-full">
          <LogCategory title="Health" logs={healthLogs} />
          <LogCategory title="Education" logs={educationLogs} />
          <LogCategory title="General Notes" logs={generalLogs} />
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default LogHistory;
