
import { useParams, Link } from 'react-router-dom';
import { mockChildren } from '@/data/mockChildren';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotFound from './NotFound';

const ChildProfilePage = () => {
  const { childId } = useParams<{ childId: string }>();
  const child = mockChildren.find(c => c.id === Number(childId));

  if (!child) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      <main className="container mx-auto px-4 md:px-8 pb-12">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Avatar className="h-28 w-28 border">
                        <AvatarImage src={child.avatarUrl} alt={`${child.name}'s profile picture`} />
                        <AvatarFallback>{child.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-4xl font-bold">{child.name}</CardTitle>
                        <CardDescription className="text-base">Date of Birth: {new Date(child.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Summary</h3>
                <p className="text-muted-foreground text-base">{child.aiSummary}</p>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                        {child.allergies.length > 0 && child.allergies[0] !== 'None' ? (
                            child.allergies.map(allergy => <Badge key={allergy} variant="secondary" className="text-base py-1 px-3">{allergy}</Badge>)
                        ) : (
                            <p className="text-muted-foreground">No known allergies.</p>
                        )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Current Medications</h3>
                        {child.medications.length > 0 ? (
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
        </div>
      </main>
    </div>
  );
};

export default ChildProfilePage;
