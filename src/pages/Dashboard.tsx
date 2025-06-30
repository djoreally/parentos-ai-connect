import { useAuth } from '@/contexts/ClerkAuthContext';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { LogEntry, Child, AppNotification } from '@/types';
import NewLogForm from '@/components/NewLogForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLogs } from '@/api/logs';
import { getChildren } from '@/api/children';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AiInsights from '@/components/AiInsights';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import Timeline from '@/components/dashboard/Timeline';
import { Button } from '@/components/ui/button';
import { MilestoneTracker } from '@/components/milestones/MilestoneTracker';
import { Rocket, AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/LoadingStates';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LOGS_PER_PAGE = 5;

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const [showMilestoneTracker, setShowMilestoneTracker] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  const { 
    data: children, 
    isLoading: isLoadingChildren, 
    error: childrenError,
    refetch: refetchChildren 
  } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: getChildren,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChildId]);

  const { 
    data: logsData, 
    isLoading: isLoadingLogs, 
    error: logsError,
    refetch: refetchLogs 
  } = useQuery<{logs: LogEntry[], count: number}>({
    queryKey: ['logs', selectedChildId, currentPage],
    queryFn: () => getLogs(selectedChildId!, currentPage),
    enabled: !!selectedChildId && !showMilestoneTracker,
    retry: 3,
    retryDelay: 1000,
  });

  const logs = logsData?.logs;
  const totalLogs = logsData?.count ?? 0;
  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

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

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.type === 'new_message' && notification.child_id) {
      setSelectedChildId(notification.child_id);
      setIsChatModalOpen(true);
    }
  };

  const selectedChild = children?.find(child => child.id === selectedChildId);

  // Show loading skeleton during initial auth load
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // Handle children loading error
  if (childrenError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 md:px-8 pb-12 pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load children profiles. Please try again.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchChildren()}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (showMilestoneTracker && selectedChild) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 md:px-8 pb-12 pt-8">
          <MilestoneTracker 
            selectedChild={selectedChild} 
            onBack={() => setShowMilestoneTracker(false)} 
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 pb-12">
        <div className="space-y-8">
          <DashboardHeader
            children={children}
            selectedChild={selectedChild}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => {
              setShowMilestoneTracker(false);
              setSelectedChildId(id);
            }}
            isLoadingChildren={isLoadingChildren}
          />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <QuickActions
              selectedChild={selectedChild}
              profile={profile}
              onNotificationClick={handleNotificationClick}
              isChatModalOpen={isChatModalOpen}
              onChatModalOpenChange={setIsChatModalOpen}
            />
            {selectedChild && (
              <Button onClick={() => setShowMilestoneTracker(true)} className="w-full lg:w-auto shrink-0">
                <Rocket className="mr-2 h-4 w-4" />
                Track Milestones
              </Button>
            )}
          </div>

          {logsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load logs. Please try again.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchLogs()}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <Timeline 
              logs={logs}
              isLoading={isLoadingLogs}
              isError={!!logsError}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
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