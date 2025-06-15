
import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Child } from '@/types';
import { Baby } from 'lucide-react';

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
}

const ChildSelector = ({ children, selectedChildId, onSelectChild }: ChildSelectorProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
       <h2 className="text-xl font-semibold text-foreground whitespace-nowrap">Viewing Profile For:</h2>
       <Select
        value={selectedChildId}
        onValueChange={onSelectChild}
      >
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue placeholder="Select a child" />
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              <div className="flex items-center gap-2">
                <Baby className="h-4 w-4 text-muted-foreground" />
                <span>{child.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChildSelector;
