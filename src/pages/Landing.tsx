
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { Shield, Users, FileText, Heart, Clock, Bell } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: "Secure Logging",
      description: "Log behaviors, symptoms, and milestones with end-to-end encryption",
      icon: Shield,
    },
    {
      name: "Team Collaboration",
      description: "Connect parents, teachers, and doctors on one secure platform",
      icon: Users,
    },
    {
      name: "Smart Documentation",
      description: "AI-powered summaries and insights from your child's data",
      icon: FileText,
    },
    {
      name: "Health Tracking",
      description: "Monitor symptoms, medications, and appointments in one place",
      icon: Heart,
    },
    {
      name: "Timeline View",
      description: "See your child's progress and patterns over time",
      icon: Clock,
    },
    {
      name: "Smart Notifications",
      description: "Get alerts for important milestones and appointments",
      icon: Bell,
    },
  ];

  const useCases = [
    {
      title: "For Parents",
      description: "Track your child's daily behaviors, health symptoms, and developmental milestones. Share insights with teachers and healthcare providers.",
      benefits: ["Behavior tracking", "Symptom monitoring", "Milestone recording", "Care team communication"]
    },
    {
      title: "For Teachers",  
      description: "Document classroom behaviors and academic progress. Collaborate with parents and specialists for better support strategies.",
      benefits: ["Classroom behavior logs", "Academic progress tracking", "Parent communication", "IEP support"]
    },
    {
      title: "For Healthcare Providers",
      description: "Access comprehensive patient histories and collaborate with families and schools for holistic care.",
      benefits: ["Patient history access", "Care coordination", "Treatment tracking", "Family communication"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Connect Your Child's{' '}
            <span className="text-blue-600">Care Team</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A secure platform for parents, teachers, and doctors to collaborate on your child's development, health, and well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Button size="lg" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/sign-in')}>
                Sign In
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need in one secure platform
            </h2>
            <p className="text-lg text-gray-600">
              Built with privacy and collaboration in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.name} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for every member of your child's care team
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start connecting your child's care team today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of families already using our platform
          </p>
          <SignedOut>
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </SignedIn>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Landing;
