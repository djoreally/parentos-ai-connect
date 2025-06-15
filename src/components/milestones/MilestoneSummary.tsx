
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Milestone, ChildMilestoneStatusWithMilestone } from '@/types';
import { groupBy, countBy } from 'lodash-es';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MilestoneSummaryProps {
  milestones: Milestone[];
  statuses: ChildMilestoneStatusWithMilestone[];
}

export function MilestoneSummary({ milestones, statuses }: MilestoneSummaryProps) {
  const summaryData = useMemo(() => {
    if (!milestones || milestones.length === 0) return [];

    const milestonesByCategory = groupBy(milestones, 'category');

    return Object.entries(milestonesByCategory).map(([category, categoryMilestones]) => {
      const categoryMilestoneIds = new Set(categoryMilestones.map(m => m.id));
      
      const categoryStatuses = statuses.filter(s => categoryMilestoneIds.has(s.milestone_id));
      
      const statusCounts = {
        not_yet: 0,
        in_progress: 0,
        achieved: 0,
        ...countBy(categoryStatuses, 'status')
      };
      
      const milestonesWithStatus = new Set(categoryStatuses.map(s => s.milestone_id));
      const milestonesWithoutStatusCount = categoryMilestones.filter(m => !milestonesWithStatus.has(m.id)).length;

      return {
        category,
        'Achieved': statusCounts.achieved || 0,
        'In Progress': statusCounts.in_progress || 0,
        'Not Yet': (statusCounts.not_yet || 0) + milestonesWithoutStatusCount,
      };
    });
  }, [milestones, statuses]);

  if (summaryData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Progress Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="Achieved" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="In Progress" stackId="a" fill="hsl(var(--primary) / 0.5)" />
            <Bar dataKey="Not Yet" stackId="a" fill="hsl(var(--muted))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
