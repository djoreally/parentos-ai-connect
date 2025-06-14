
import { BrainCircuit } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-6 px-4 md:px-8">
      <div className="flex items-center space-x-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">ParentOS</h1>
          <p className="text-sm text-muted-foreground">One voice. All contexts. All caregivers.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
