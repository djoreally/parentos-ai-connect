
import { supabase } from '@/integrations/supabase/client';
import { ChildMilestoneStatus, Milestone, MilestoneStatus, ChildMilestoneStatusWithMilestone } from '@/types';

export const getMilestones = async (): Promise<Milestone[]> => {
    const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('age_group');

    if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
    }

    return data as Milestone[];
};

export const getChildMilestoneStatuses = async (childId: string): Promise<ChildMilestoneStatusWithMilestone[]> => {
    if (!childId) return [];

    const { data, error } = await supabase
        .from('child_milestone_status')
        .select(`
            *,
            milestones (*)
        `)
        .eq('child_id', childId);

    if (error) {
        console.error('Error fetching child milestone statuses:', error);
        throw error;
    }
    
    return data as unknown as ChildMilestoneStatusWithMilestone[];
};

export const upsertChildMilestoneStatus = async (
    childId: string,
    milestoneId: string,
    status: MilestoneStatus,
    notes?: string
): Promise<ChildMilestoneStatus> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('child_milestone_status')
        .upsert({
            child_id: childId,
            milestone_id: milestoneId,
            status: status,
            notes: notes,
            updated_by_user_id: user.id,
        }, {
            onConflict: 'child_id, milestone_id'
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting milestone status:', error);
        throw error;
    }
    
    return data as ChildMilestoneStatus;
};
