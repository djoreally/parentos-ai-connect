import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotFound from './NotFound';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getLogs, generatePdfDigest } from '@/api/logs';
import { getChildById } from '@/api/children';
import { Skeleton } from '@/components/ui/skeleton';
import EmotionTimelineChart from '@/components/EmotionTimelineChart';
import LogHistory from '@/components/LogHistory';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import { logAuditEvent } from '@/api/audit';
import { useAuth } from '@/contexts/ClerkAuthContext';

const ChildProfilePage = () => {
  const { childId } = useParams<{ childId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: child, isLoading: isLoadingChild } = useQuery({
    queryKey: ['child', childId],
    queryFn: () => getChildById(childId!),
    enabled: !!childId,
  });

  useEffect(() => {
    if (childId && user) {
      logAuditEvent('CHILD_PROFILE_VIEWED', {
        target_entity: 'child',
        target_id: childId,
      });
    }
  }, [childId, user]);

  const { data: logsData, isLoading: isLoadingLogs, isError } = useQuery({
    queryKey: ['logs', childId, 'all'],
    queryFn: () => getLogs(childId!, 1, true),
    enabled: !!childId,
  });

  const logs = logsData?.logs;

  const generateDigestMutation = useMutation({
    mutationFn: ({ childId, startDate, endDate }: { childId: string; startDate: Date; endDate: Date; }) => 
        generatePdfDigest(childId, startDate, endDate),
    onSuccess: (blob, variables) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weekly-digest-${child?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ 
          title: "Digest Downloaded", 
          description: "PDF successfully generated. Please handle with care and avoid sharing via unsecure channels like email.",
          duration: 7000,
        });
    },
    onError: (error) => {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "Failed to generate PDF digest. The service may be busy, please try again in a moment." });
    },
  });

  const handleGenerateDigest = () => {
    if (!childId) return;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    toast({ title: "Processing", description: "Generating your weekly digest... This can take up to a minute." });
    generateDigestMutation.mutate({ childId, startDate, endDate });
  };

  if (isLoadingChild) {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            <Header />
            <main className="container mx-auto px-4 md:px-8 pb-12">
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </main>
        </div>
    )
  }

  if (!child) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      <main className="container mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="default" onClick={handleGenerateDigest} disabled={generateDigestMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {generateDigestMutation.isPending ? 'Generating...' : 'Download Weekly Digest'}
          </Button>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Avatar className="h-28 w-28 border">
                        <AvatarImage src={child.avatar_url || undefined} alt={`${child.name}'s profile picture`} />
                        <AvatarFallback>{child.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-4xl font-bold">{child.name}</CardTitle>
                        <CardDescription className="text-base">Date of Birth: {new Date(child.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Summary</h3>
                <p className="text-muted-foreground text-base">{child.ai_summary}</p>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                        {child.allergies && child.allergies.length > 0 && child.allergies[0] !== 'None' ? (
                            child.allergies.map(allergy => <Badge key={allergy} variant="secondary" className="text-base py-1 px-3">{allergy}</Badge>)
                        ) : (
                            <p className="text-muted-foreground">No known allergies.</p>
                        )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Current Medications</h3>
                        {child.medications && child.medications.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {child.medications.map(med => <li key={med} className="text-base">{med}</li>)}
                        </ul>
                        ) : (
                        <p className="text-muted-foreground">No current medications.</p>
                        )}
                    </div>
               </div>
            </CardContent>
          </Card>
          
          {isLoadingLogs && (
            <>
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </>
          )}

          {isError && (
              <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load log history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">There was a problem fetching the data. Please try again later.</p>
                </CardContent>
              </Card>
          )}

          {logs && (
            <>
              <EmotionTimelineChart logs={logs} />
              <LogHistory logs={logs} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChildProfilePage;
