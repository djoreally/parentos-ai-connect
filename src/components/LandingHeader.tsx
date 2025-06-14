
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

const LandingHeader = () => {
  const navLinks = [
    { title: 'About', href: '#about' },
    { title: 'Features', href: '#features' },
    { title: 'Testimonials', href: '#testimonials' },
    { title: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ParentOS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.title} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.title}
            </a>
          ))}
        </nav>
        <Button asChild>
          <Link to="/register">Request Demo</Link>
        </Button>
      </div>
    </header>
  );
};

export default LandingHeader;
