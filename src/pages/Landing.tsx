
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          The Missing Link in Your Child's Care Network
        </h2>
        <p className="max-w-3xl text-lg md:text-xl text-muted-foreground mb-8">
          ParentOS translates observations from parents, teachers, and doctors into a unified timeline, providing actionable insights for everyone involved in a child's well-being.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link to="/signup">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">
              I Already Have an Account
            </Link>
          </Button>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} ParentOS. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
