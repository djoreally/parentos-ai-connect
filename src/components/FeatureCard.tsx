
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="text-center items-center flex flex-col pt-6 bg-transparent border-border">
      <CardHeader>
        <div className="bg-primary/10 p-4 rounded-full mx-auto">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
