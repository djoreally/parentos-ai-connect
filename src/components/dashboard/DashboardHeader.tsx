
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ChildSelector from '@/components/ChildSelector';
import ChildProfileCard from '@/components/ChildProfileCard';
import { Child } from '@/types';

interface DashboardHeaderProps {
  children: Child[] | undefined;
  selectedChild: Child | undefined;
  selectedChildId: string | undefined;
  onSelectChild: (id: string) => void;
  isLoadingChildren: boolean;
}

const DashboardHeader = ({
  children,
  selectedChild,
  selectedChildId,
  onSelectChild,
  isLoadingChildren,
}: DashboardHeaderProps) => {
  if (isLoadingChildren) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (children && children.length > 0 && selectedChild) {
    return (
      <div className="space-y-4">
        <ChildSelector
          children={children}
          selectedChildId={selectedChildId!}
          onSelectChild={onSelectChild}
        />
        <Link to={`/child/${selectedChild.id}`} className="block rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <ChildProfileCard child={selectedChild} />
        </Link>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to ParentOS</CardTitle>
        <CardDescription>Please add a child profile to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/add-child">Add Child Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;
