import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';
import { Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Unified Timeline',
      description: 'View all observations from parents, teachers, and doctors in one place.',
    },
    {
      icon: Calendar,
      title: 'Progress Tracking',
      description: "Monitor your child's development over time with visual progress reports.",
    },
    {
      icon: TrendingUp,
      title: 'Collaborative Insights',
      description: 'Share insights and collaborate with all caregivers to ensure consistent support.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Miller',
      role: 'Parent',
      quote: "ParentOS has transformed how we support our child. The unified timeline makes it easy to stay informed and collaborate with teachers and doctors.",
    },
    {
      name: 'David Chen',
      role: 'Parent',
      quote: "I love the progress tracking feature. It's so helpful to see my child's development over time and identify areas where we can provide extra support.",
    },
    {
      name: 'Emily Rodriguez',
      role: 'Parent',
      quote: "ParentOS has been a game-changer for our family. It's brought everyone together and ensured we're all on the same page about our child's needs.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="py-32 md:py-40 flex items-center justify-center text-center bg-primary text-primary-foreground"
        >
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Connect Caregivers, Support Your Child's Growth
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-primary-foreground/90 mb-8">
              ParentOS integrates insights from parents, teachers, and doctors into a single timeline, ensuring comprehensive support for your child's well-being.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Why ParentOS Section */}
        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ParentOS?</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              ParentOS bridges the communication gap between caregivers, providing a unified view of your child's development. Track progress, identify needs, and collaborate effectively to ensure your child thrives.
            </p>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                ParentOS offers a range of features designed to streamline communication and support your child's growth.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Testimonials</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.name}
                  name={testimonial.name}
                  role={testimonial.role}
                  quote={testimonial.quote}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Connect Caregivers and Support Your Child's Growth?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
              Request a demo today and see how ParentOS can transform your child's well-being.
            </p>
            <Button asChild size="lg">
              <Link to="/register">Request Demo</Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
