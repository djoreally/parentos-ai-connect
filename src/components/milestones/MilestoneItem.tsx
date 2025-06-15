
import { ChildMilestoneStatusWithMilestone, Milestone, MilestoneStatus } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import debounce from 'lodash-es/debounce';
import { useMemo } from "react";

interface MilestoneItemProps {
  milestone: Milestone;
  status: ChildMilestoneStatusWithMilestone | undefined;
  onStatusChange: (milestoneId: string, status: MilestoneStatus, notes?: string) => void;
}

const statusOptions: { value: MilestoneStatus; label: string }[] = [
  { value: "not_yet", label: "Not Yet" },
  { value: "in_progress", label: "In Progress" },
  { value: "achieved", label: "Achieved" },
];

export function MilestoneItem({ milestone, status, onStatusChange }: MilestoneItemProps) {
  const [notes, setNotes] = useState(status?.notes ?? "");
  const [currentStatus, setCurrentStatus] = useState<MilestoneStatus>(status?.status ?? 'not_yet');

  const debouncedStatusChange = useMemo(
    () => debounce((milestoneId: string, status: MilestoneStatus, notes?: string) => {
      onStatusChange(milestoneId, status, notes);
    }, 500),
    [onStatusChange]
  );
  
  const handleStatusChange = (newStatus: MilestoneStatus) => {
    setCurrentStatus(newStatus);
    debouncedStatusChange(milestone.id, newStatus, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedStatusChange(milestone.id, currentStatus, newNotes);
  };
  
  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <p className="font-medium text-gray-800">{milestone.description}</p>
      <RadioGroup
        value={currentStatus}
        onValueChange={handleStatusChange}
        className="flex items-center space-x-4 mt-2"
      >
        {statusOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${milestone.id}-${option.value}`} />
            <Label htmlFor={`${milestone.id}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Textarea
        placeholder="Add a note (optional)..."
        value={notes}
        onChange={handleNotesChange}
        className="mt-2 text-sm"
      />
    </div>
  );
}
