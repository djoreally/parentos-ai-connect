import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import LogCard from '@/components/LogCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockLogs } from '@/data/mockLogs.tsx';
import { mockChildren } from '@/data/mockChildren';
import { LogEntry, Child } from '@/types';
import { Mic, UploadCloud, Languages, BrainCircuit } from 'lucide-react';
import ChildProfileCard from '@/components/ChildProfileCard';
import ChildSelector from '@/components/ChildSelector';
import NewLogForm from '@/components/NewLogForm';

const Dashboard = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs || []);
  const [children] = useState<Child[]>(mockChildren || []);
  const [selectedChildId, setSelectedChildId] = useState<number>(children[0]?.id || 0);

  const selectedChild = children.find(child => child.id === selectedChildId);

  const handleAddNewLog = (newLog: LogEntry) => {
    setLogs([newLog, ...logs]);
  };

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
              <Button size="lg" variant="outline"><Mic /> Log Voice Note</Button>
              <Button size="lg" variant="outline"><UploadCloud /> Upload Form</Button>
              <Button size="lg" variant="outline"><Languages /> Translate Message</Button>
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
              {logs.map(log => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
            <div className="space-y-6">
              <NewLogForm onAddLog={handleAddNewLog} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
