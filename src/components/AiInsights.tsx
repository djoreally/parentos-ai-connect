
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogEntry } from "@/types";
import { BrainCircuit, TrendingDown, Users, BedDouble } from 'lucide-react';
import { useMemo } from 'react';

interface AiInsightsProps {
  logs: LogEntry[];
}

type Insight = {
  icon: React.ReactNode;
  text: string;
  color: string;
};

// This is a mock analysis function. In a real app, this would be a complex backend service.
const generateInsights = (logs: LogEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  const anxietyLogs = logs.filter(log => log.tags.includes('anxiety'));
  const sleepLogs = logs.filter(log => log.tags.includes('sleep'));
  const schoolLogs = logs.filter(log => log.tags.includes('school'));
  const socialLogs = logs.filter(log => log.tags.includes('social'));
  
  if (anxietyLogs.length > 0 && sleepLogs.length > 0) {
    insights.push({
      icon: <BedDouble className="h-5 w-5" />,
      text: "Pattern Detected: Poor sleep seems linked to reports of anxiety. Consider a calming bedtime routine.",
      color: "text-red-500",
    });
  }
  
  if (anxietyLogs.length > 0 && schoolLogs.some(l => l.original_entry.description.includes('transition'))) {
     insights.push({
      icon: <TrendingDown className="h-5 w-5" />,
      text: "Correlation Found: Anxiety may be contributing to difficulty with transitions at school.",
      color: "text-amber-600",
    });
  }

  if (socialLogs.some(l => l.emotionScore && l.emotionScore >= 4)) {
     insights.push({
      icon: <Users className="h-5 w-5" />,
      text: "Positive Trend: Structured social activities, like park visits, correlate with high positive mood scores.",
      color: "text-green-600",
    });
  }

  if (insights.length === 0) {
     insights.push({
      icon: <BrainCircuit className="h-5 w-5" />,
      text: "Not enough data for deep insights yet. Keep logging to unlock patterns!",
      color: "text-gray-500",
    });
  }

  return insights;
}

const AiInsights = ({ logs }: AiInsightsProps) => {
  const insights = useMemo(() => generateInsights(logs), [logs]);

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
        <ul className="space-y-4">
          {insights.map((insight, index) => (
            <li key={index} className={`flex items-start gap-3 ${insight.color}`}>
              <div className="mt-1">{insight.icon}</div>
              <p className="text-sm font-medium text-card-foreground">{insight.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
