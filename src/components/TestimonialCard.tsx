
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TestimonialCardProps {
  image?: string;
  name: string;
  role: string;
  quote: string;
}

const TestimonialCard = ({ image, name, role, quote }: TestimonialCardProps) => {
  return (
    <Card className="flex flex-col items-center text-center p-8 bg-card">
       <Avatar className="w-24 h-24 mb-4">
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="text-3xl bg-muted">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <CardContent className="p-0">
        <blockquote className="text-muted-foreground mb-4 italic">"{quote}"</blockquote>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
