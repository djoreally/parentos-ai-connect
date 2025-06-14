
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChildProfileCard = () => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Leo's Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg" alt="Leo's profile picture" />
          <AvatarFallback>LEO</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            AI Summary: Leo is showing signs of anxiety, especially around transitions and new social situations. He may benefit from a predictable routine and extra verbal preparation before changes in activity. Monitor for shirt-chewing and offer gentle redirections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildProfileCard;
