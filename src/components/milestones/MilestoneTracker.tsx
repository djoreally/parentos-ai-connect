
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMilestones, getChildMilestoneStatuses, upsertChildMilestoneStatus } from '@/api/milestones';
import { Milestone, ChildMilestoneStatusWithMilestone, Child, MilestoneStatus } from '@/types';
import { MilestoneGroup } from './MilestoneGroup';
import { groupBy } from 'lodash-es';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MilestoneSummary } from './MilestoneSummary';

interface MilestoneTrackerProps {
  selectedChild: Child;
  onBack: () => void;
}

export function MilestoneTracker({ selectedChild, onBack }: MilestoneTrackerProps) {
  const queryClient = useQueryClient();

  const { data: milestones, isLoading: isLoadingMilestones } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: getMilestones,
  });

  const { data: statuses, isLoading: isLoadingStatuses } = useQuery<ChildMilestoneStatusWithMilestone[]>({
    queryKey: ['milestoneStatuses', selectedChild.id],
    queryFn: () => getChildMilestoneStatuses(selectedChild.id),
    enabled: !!selectedChild,
  });

  const mutation = useMutation({
    mutationFn: ({ milestoneId, status, notes }: { milestoneId: string; status: MilestoneStatus; notes?: string }) =>
      upsertChildMilestoneStatus(selectedChild.id, milestoneId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestoneStatuses', selectedChild.id] });
    },
    onError: (error) => {
        console.error("Failed to update milestone:", error);
    }
  });

  const handleStatusChange = (milestoneId: string, status: MilestoneStatus, notes?: string) => {
    mutation.mutate({ milestoneId, status, notes });
  };
  
  const groupedMilestones = useMemo(() => {
    if (!milestones) return {};
    return groupBy(milestones, (m) => `${m.age_group} - ${m.category}`);
  }, [milestones]);

  const isLoading = isLoadingMilestones || isLoadingStatuses;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold mt-2">Milestone Tracker for {selectedChild.name}</h1>
          </div>
      </div>

      {isLoading ? (
         <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
         </div>
      ) : (
        <div className="space-y-6">
          <MilestoneSummary milestones={milestones ?? []} statuses={statuses ?? []} />
          {Object.entries(groupedMilestones).map(([groupTitle, groupMilestones]) => (
            <MilestoneGroup
              key={groupTitle}
              title={groupTitle}
              milestones={groupMilestones}
              statuses={statuses ?? []}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
