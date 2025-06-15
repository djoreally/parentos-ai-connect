
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ChildProfileCard from '@/components/ChildProfileCard';
import { Link } from 'react-router-dom';
import { Child } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getChildren } from '@/api/children';
import { Skeleton } from '@/components/ui/skeleton';

const TeamDashboardPage = () => {
    const { data: children, isLoading } = useQuery<Child[]>({
        queryKey: ['children'],
        queryFn: getChildren,
    });

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 md:px-8 pb-12">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Team Member Dashboard</CardTitle>
                            <CardDescription>Select a child to view their profile and timeline.</CardDescription>
                        </CardHeader>
                    </Card>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">Your Connected Children</h2>
                        {isLoading ? (
                             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                             </div>
                        ) : children && children.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {children.map(child => (
                                    <Link key={child.id} to={`/child/${child.id}`} className="block rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                        <ChildProfileCard child={child} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Children Found</CardTitle>
                                    <CardDescription>No children are currently assigned to your profile.</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamDashboardPage;
