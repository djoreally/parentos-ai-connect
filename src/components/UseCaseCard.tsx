
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UseCaseCardProps {
  image?: string;
  title: string;
  description: string;
}

const UseCaseCard = ({ image, title, description }: UseCaseCardProps) => {
  return (
    <div className="flex h-full flex-1 flex-col min-w-[16rem] flex-shrink-0">
      <Card className="h-full flex flex-col">
        {image && (
          <CardHeader className="p-0">
            <img src={image} alt={title} className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-t-lg" />
          </CardHeader>
        )}
        <CardContent className="flex flex-col gap-1 p-4 flex-1">
          <h3 className="text-base font-bold leading-tight text-foreground">{title}</h3>
          <p className="text-sm font-normal leading-normal text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UseCaseCard;
