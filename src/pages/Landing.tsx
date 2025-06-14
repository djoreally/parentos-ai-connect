
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';
import { Users, Calendar, ChartLine } from 'lucide-react';

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
      icon: ChartLine,
      title: 'Collaborative Insights',
      description: 'Share insights and collaborate with all caregivers to ensure consistent support.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Miller',
      role: 'Parent',
      quote: "ParentOS has transformed how we support our child. The unified timeline makes it easy to stay informed and collaborate with teachers and doctors.",
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: 'David Chen',
      role: 'Parent',
      quote: "I love the progress tracking feature. It's so helpful to see my child's development over time and identify areas where we can provide extra support.",
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Parent',
      quote: "ParentOS has been a game-changer for our family. It's brought everyone together and ensured we're all on the same page about our child's needs.",
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <LandingHeader />
      <main className="flex flex-1 justify-center py-5 px-4 sm:px-10">
        <div className="flex max-w-[960px] flex-1 flex-col @container">
          {/* Hero Section */}
          <section>
            <div
              className="flex min-h-[480px] flex-col gap-6 @[480px]:gap-8 items-center justify-center p-4 rounded-lg bg-cover bg-center text-center"
              style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop")' }}
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-4xl @[480px]:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Connect Caregivers, Support Your Child's Growth
                </h1>
                <h2 className="text-white text-sm @[480px]:text-base font-normal leading-normal">
                  ParentOS integrates insights from parents, teachers, and doctors into a single timeline, ensuring comprehensive support for your child's well-being.
                </h2>
              </div>
              <Button asChild className="h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm @[480px]:text-base font-bold leading-normal tracking-[0.015em]">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </section>

          {/* Why ParentOS Section */}
          <section id="about" className="text-center">
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Why ParentOS?</h2>
            <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
              ParentOS bridges the communication gap between caregivers, providing a unified view of your child's development. Track progress, identify needs, and collaborate effectively to ensure your child thrives.
            </p>
          </section>

          {/* Key Features Section */}
          <section id="features" className="px-4 py-10">
            <div className="flex flex-col gap-4 mb-10">
              <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                Key Features
              </h1>
              <p className="text-[#111418] text-base font-normal leading-normal max-w-[720px]">
                ParentOS offers a range of features designed to streamline communication and support your child's growth.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials">
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Testimonials</h2>
            <div className="flex overflow-x-auto p-4 gap-3 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.name}
                  name={testimonial.name}
                  role={testimonial.role}
                  quote={testimonial.quote}
                  image={testimonial.image}
                />
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section id="pricing" className="text-center px-4 py-10 @[480px]:px-10 @[480px]:py-20">
            <div className="flex flex-col gap-2 text-center max-w-[720px] mx-auto">
              <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                Ready to Connect Caregivers and Support Your Child's Growth?
              </h1>
              <p className="text-[#111418] text-base font-normal leading-normal mb-8">
                Request a demo today and see how ParentOS can transform your child's well-being.
              </p>
            </div>
            <Button asChild className="h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm @[480px]:text-base font-bold leading-normal tracking-[0.015em]">
              <Link to="/register">Request Demo</Link>
            </Button>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
