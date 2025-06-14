
import { Badge } from '@/components/ui/badge';

interface Template {
  title: string;
  description: string;
}

const quickLogTemplates: Template[] = [
  { title: "Had a great day", description: "Today was a positive day. Some highlights include: " },
  { title: "Feeling sick", description: "Symptoms: \nTime: \nActions taken: " },
  { title: "Behavioral issue", description: "Behavior observed: \nContext/Trigger: \nResponse/Outcome: " },
];

interface QuickLogTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

const QuickLogTemplates = ({ onSelectTemplate }: QuickLogTemplatesProps) => {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">Quick Templates</p>
      <div className="flex flex-wrap gap-2">
        {quickLogTemplates.map((template) => (
          <Badge
            key={template.title}
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => onSelectTemplate(template)}
          >
            {template.title}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default QuickLogTemplates;
