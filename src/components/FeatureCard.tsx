
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <Icon className="h-6 w-6 text-foreground" />
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold leading-tight text-foreground">{title}</h2>
        <p className="text-sm font-normal leading-normal text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
