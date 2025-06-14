
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogEntry } from "@/types";
import { BrainCircuit, TrendingDown, Users, BedDouble } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAiInsights } from "@/api/ai";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface AiInsightsProps {
  logs: LogEntry[];
}

const iconComponents: Record<string, React.ReactNode> = {
  BedDouble: <BedDouble className="h-5 w-5" />,
  TrendingDown: <TrendingDown className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
};

export type Insight = {
  iconName: keyof typeof iconComponents;
  text: string;
  color: string;
};

const AiInsights = ({ logs }: AiInsightsProps) => {
  const { data: insights, isLoading, isError } = useQuery({
    queryKey: ['aiInsights', logs.map(l => l.id).join('-')],
    queryFn: () => getAiInsights(logs),
    enabled: logs.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Patterns from the timeline.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        )}
        {isError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Could not generate AI insights at this time.
                </AlertDescription>
            </Alert>
        )}
        {insights && (
            <ul className="space-y-4">
            {insights.map((insight, index) => (
                <li key={index} className={`flex items-start gap-3 ${insight.color}`}>
                <div className="mt-1">{iconComponents[insight.iconName] || <BrainCircuit className="h-5 w-5" />}</div>
                <p className="text-sm font-medium text-card-foreground">{insight.text}</p>
                </li>
            ))}
            </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AiInsights;
