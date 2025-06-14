
import { BrainCircuit, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Header = () => {
  const { profile } = useAuth();

  return (
    <header className="py-6 px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">ParentOS</h1>
          <p className="text-sm text-muted-foreground">One voice. All contexts. All caregivers.</p>
        </div>
      </Link>
      {profile?.role === 'Admin' && (
        <Button asChild variant="outline">
          <Link to="/compliance" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Compliance
          </Link>
        </Button>
      )}
    </header>
  );
};

export default Header;
