
import { BrainCircuit } from 'lucide-react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { UserNav } from './UserNav';

const Header = () => {
  const { profile } = useAuth();

  return (
    <header className="py-4 px-4 md:px-8 flex items-center justify-between border-b bg-background">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Parentrak</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">One voice. All contexts. All caregivers.</p>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <UserNav />
      </div>
    </header>
  );
};

export default Header;
