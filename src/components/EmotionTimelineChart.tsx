
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LogEntry } from "@/types";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type EmotionTimelineChartProps = {
  logs: LogEntry[];
};

const EmotionTimelineChart = ({ logs }: EmotionTimelineChartProps) => {
  const chartData = useMemo(() => {
    return logs
      .filter(log => typeof log.emotionScore === 'number')
      .map(log => ({
        date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        emotion: log.emotionScore,
        title: log.original_entry.title,
      }))
      .reverse(); // To show oldest to newest
  }, [logs]);

  if (chartData.length < 2) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Emotion Timeline</CardTitle>
                <CardDescription>Not enough data to display a timeline yet.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Please add more logs with emotion scores.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Timeline</CardTitle>
        <CardDescription>A summary of observed emotional states over the last few entries.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
                domain={[1, 5]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => {
                    const labels = ['V. Neg', 'Neg', 'Neu', 'Pos', 'V. Pos'];
                    return labels[value-1] || '';
                }}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent
                formatter={(value, name, props) => {
                    return (
                        <div className="flex flex-col gap-0.5">
                            <p className="font-semibold">{props.payload.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Emotion Score: <span className="font-medium text-foreground">{props.payload.emotion}</span>
                            </p>
                        </div>
                    )
                }}
              />}
            />
            <Line
              type="monotone"
              dataKey="emotion"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: "hsl(var(--primary))",
                r: 4,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EmotionTimelineChart;
