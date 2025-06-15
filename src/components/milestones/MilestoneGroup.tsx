
import { ChildMilestoneStatusWithMilestone, Milestone, MilestoneStatus } from "@/types";
import { MilestoneItem } from "./MilestoneItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MilestoneGroupProps {
  title: string;
  milestones: Milestone[];
  statuses: ChildMilestoneStatusWithMilestone[];
  onStatusChange: (milestoneId: string, status: MilestoneStatus, notes?: string) => void;
}

export function MilestoneGroup({ title, milestones, statuses, onStatusChange }: MilestoneGroupProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            status={statuses.find(s => s.milestone_id === milestone.id)}
            onStatusChange={onStatusChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}
