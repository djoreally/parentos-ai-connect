
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Child } from "@/types";

interface ChildProfileCardProps {
  child: Child;
}

const ChildProfileCard = ({ child }: ChildProfileCardProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{child.name}'s Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={child.avatarUrl} alt={`${child.name}'s profile picture`} />
          <AvatarFallback>{child.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            AI Summary: {child.aiSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildProfileCard;
