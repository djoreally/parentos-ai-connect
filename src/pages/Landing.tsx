
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { BrainCircuit, Users, Shield, Calendar, MessageSquare, BarChart3 } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import UseCaseCard from '@/components/UseCaseCard';

const Landing = () => {
  const { user } = useUser();

  // If user is signed in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-8 flex justify-center">
            <BrainCircuit className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            One voice. All contexts.
            <span className="block text-primary">All caregivers.</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Streamline communication and care coordination for children with complex needs. 
            Connect parents, teachers, doctors, and therapists in one secure platform.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to="/login">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 px-4 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Comprehensive tools designed specifically for coordinating care across multiple providers and contexts.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Unified Communication"
              description="Real-time messaging between all care team members with context-aware conversations."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Appointment Coordination"
              description="Sync schedules across providers and never miss important appointments or sessions."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Progress Tracking"
              description="Monitor development milestones and share insights across the entire care team."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Management"
              description="Easily add and manage access for teachers, therapists, doctors, and family members."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="HIPAA Compliant"
              description="Enterprise-grade security ensuring all communications and data remain private and secure."
            />
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8" />}
              title="AI Insights"
              description="Get intelligent suggestions and pattern recognition to optimize care strategies."
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="px-4 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Built for complex care coordination
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Whether managing autism support, special education, or multiple medical conditions, 
              Parentrak adapts to your family's unique needs.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <UseCaseCard
              title="Special Education Coordination"
              description="Connect with teachers, special education coordinators, and therapists to ensure IEP goals are met across all environments."
              features={[
                "IEP goal tracking and progress sharing",
                "Behavior data collection across settings",
                "Real-time communication with school team",
                "Appointment scheduling with specialists"
              ]}
            />
            <UseCaseCard
              title="Medical Care Management"
              description="Coordinate between multiple specialists, primary care, and family to ensure comprehensive medical care."
              features={[
                "Centralized medical history and notes",
                "Appointment reminders and scheduling",
                "Medication tracking and updates",
                "Secure sharing of medical reports"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-20 text-primary-foreground sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to streamline your care coordination?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join families who have transformed how they manage their child's care team.
          </p>
          <SignedOut>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link to="/register">Start Your Free Trial</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Landing;
