
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import LogCard from '@/components/LogCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockChildren } from '@/data/mockChildren';
import { LogEntry, Child } from '@/types';
import { Mic, UploadCloud, Languages, BrainCircuit } from 'lucide-react';
import ChildProfileCard from '@/components/ChildProfileCard';
import ChildSelector from '@/components/ChildSelector';
import NewLogForm from '@/components/NewLogForm';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '@/api/logs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import VoiceNoteModal from '@/components/VoiceNoteModal';
import UploadFormModal from '@/components/UploadFormModal';
import TranslateMessageModal from '@/components/TranslateMessageModal';
import AiInsights from '@/components/AiInsights';

const Dashboard = () => {
  const { data: logs, isLoading, isError } = useQuery<LogEntry[]>({
    queryKey: ['logs'],
    queryFn: getLogs,
  });

  const [children] = useState<Child[]>(mockChildren || []);
  const [selectedChildId, setSelectedChildId] = useState<number>(children[0]?.id || 0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 pb-12">
        <div className="space-y-8">
          
          {children.length > 0 && selectedChild ? (
            <>
              <ChildSelector 
                children={children}
                selectedChildId={selectedChildId}
                onSelectChild={(id) => setSelectedChildId(Number(id))}
              />
              <Link to={`/child/${selectedChild.id}`} className="block rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <ChildProfileCard child={selectedChild} />
              </Link>
            </>
          ) : (
             <Card>
              <CardHeader>
                <CardTitle>Welcome to ParentOS</CardTitle>
                <CardDescription>Please add a child profile to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Add Child Profile</Button>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Dialog open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline"><Mic /> Log Voice Note</Button>
                </DialogTrigger>
                <VoiceNoteModal onOpenChange={setIsVoiceModalOpen} />
              </Dialog>

              <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline"><UploadCloud /> Upload Form</Button>
                </DialogTrigger>
                <UploadFormModal onOpenChange={setIsUploadModalOpen} />
              </Dialog>

              <Dialog open={isTranslateModalOpen} onOpenChange={setIsTranslateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline"><Languages /> Translate Message</Button>
                </DialogTrigger>
                <TranslateMessageModal onOpenChange={setIsTranslateModalOpen} />
              </Dialog>
              
              <Button asChild size="lg" variant="outline">
                <Link to="/assistant">
                  <BrainCircuit /> Ask AI Assistant
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Child's Timeline</h2>
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {isError && (
                <Card>
                  <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load the timeline. Please try again later.</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {logs?.map(log => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
            <div className="space-y-6">
              {logs && logs.length > 0 && <AiInsights logs={logs} />}
              <NewLogForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
