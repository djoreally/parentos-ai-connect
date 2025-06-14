
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { LogEntry, Child, AppNotification, Profile } from '@/types';
import NewLogForm from '@/components/NewLogForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLogs } from '@/api/logs';
import { getChildren } from '@/api/children';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AiInsights from '@/components/AiInsights';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import Timeline from '@/components/dashboard/Timeline';

const Dashboard = () => {
  const { data: children, isLoading: isLoadingChildren } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: getChildren,
  });

  const { profile } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const { data: logs, isLoading: isLoadingLogs, isError } = useQuery<LogEntry[]>({
    queryKey: ['logs', selectedChildId],
    queryFn: () => getLogs(selectedChildId!),
    enabled: !!selectedChildId,
  });

  useEffect(() => {
    if (!selectedChildId) return;

    const channel = supabase
      .channel(`realtime-logs-for-child-${selectedChildId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `child_id=eq.${selectedChildId}`,
        },
        (payload) => {
          console.log('New log received via realtime!', payload);
          const newLog = payload.new as LogEntry;
          toast.info(`New log from ${newLog.author}: "${newLog.original_entry.title}"`);
          queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime channel subscribed for child: ${selectedChildId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime channel error for child ${selectedChildId}:`, err);
        }
      });

    return () => {
      console.log(`Unsubscribing from realtime channel for child: ${selectedChildId}`);
      supabase.removeChannel(channel);
    };
  }, [selectedChildId, queryClient]);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.type === 'new_message' && notification.child_id) {
      setSelectedChildId(notification.child_id);
      setIsChatModalOpen(true);
    }
  };

  const selectedChild = children?.find(child => child.id === selectedChildId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 pb-12">
        <div className="space-y-8">
          
          <DashboardHeader
            children={children}
            selectedChild={selectedChild}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            isLoadingChildren={isLoadingChildren}
          />

          <QuickActions
            selectedChild={selectedChild}
            profile={profile}
            onNotificationClick={handleNotificationClick}
            isChatModalOpen={isChatModalOpen}
            onChatModalOpenChange={setIsChatModalOpen}
          />

          <div className="grid gap-12 md:grid-cols-3">
            <Timeline 
              logs={logs}
              isLoading={isLoadingLogs}
              isError={isError}
            />
            <div className="space-y-6">
              {logs && logs.length > 0 && <AiInsights logs={logs} />}
              <NewLogForm selectedChildId={selectedChildId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
