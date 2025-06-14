import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';
import { Users, Calendar, ChartLine, BrainCircuit, Youtube } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Unified Timeline',
      description: 'View all observations from parents, teachers, and doctors in one place.',
    },
    {
      icon: BrainCircuit,
      title: 'AI-Powered Insights',
      description: 'Leverage AI to summarize logs, identify trends, and provide suggestions.',
    },
    {
      icon: Users,
      title: 'Collaborative Tools',
      description: 'Securely share information and collaborate with the entire care team.',
    },
    {
      icon: ChartLine,
      title: 'Progress Tracking',
      description: "Monitor your child's development over time with visual progress reports.",
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

  const faqs = [
    {
      question: "How is my child's data kept private and secure?",
      answer: "We use state-of-the-art encryption and follow strict privacy protocols to ensure your data is always safe. Only authorized members of your care team can access the information. Our platform is designed to be compliant with privacy regulations like HIPAA.",
    },
    {
      question: "Who can I invite to my child's care team?",
      answer: "You can invite anyone you trust, including family members, teachers, therapists, and doctors. You have full control over who sees what information and can manage permissions for each team member.",
    },
    {
      question: "What kind of support is available if I need help?",
      answer: "We offer comprehensive support through our help center, email, and live chat. Our team is always ready to assist you with any questions or issues you may encounter.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex flex-1 justify-center py-5 px-4 sm:px-10">
        <div className="flex max-w-[960px] flex-1 flex-col @container">
          {/* Hero Section */}
          <section>
            <div
              className="flex min-h-[480px] flex-col gap-6 @[480px]:gap-8 items-center justify-center p-4 rounded-lg bg-accent text-center"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-foreground text-4xl @[480px]:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Connect Caregivers, Support Your Child's Growth
                </h1>
                <h2 className="text-muted-foreground text-sm @[480px]:text-base font-normal leading-normal">
                  ParentOS integrates insights from parents, teachers, and doctors into a single timeline, ensuring comprehensive support for your child's well-being.
                </h2>
              </div>
              <Button asChild className="h-10 px-4 @[480px]:h-12 @[480px]:px-5 text-sm @[480px]:text-base font-bold leading-normal tracking-[0.015em]">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </section>

          {/* Why ParentOS Section */}
          <section id="about" className="text-center">
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Why ParentOS?</h2>
            <p className="text-foreground text-base font-normal leading-normal pb-3 pt-1 px-4">
              ParentOS bridges the communication gap between caregivers, providing a unified view of your child's development. Track progress, identify needs, and collaborate effectively to ensure your child thrives.
            </p>
          </section>

          {/* Visuals Section */}
          <section className="px-4 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">See ParentOS in Action</h2>
              <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">
                Explore how our intuitive interface brings all your child's information together in one place.
              </p>
              <div className="mt-8 w-full max-w-4xl">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1470&auto=format&fit=crop" 
                  alt="ParentOS dashboard screenshot" 
                  className="rounded-lg shadow-lg border border-border"
                />
              </div>
            </div>
          </section>

          {/* Onboarding Video Section */}
          <section className="px-4 py-10 text-center">
            <div className="flex justify-center items-center gap-2">
              <Youtube className="h-6 w-6 text-primary" />
              <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">Watch How ParentOS Works</h2>
            </div>
            <p className="text-foreground text-base font-normal leading-normal my-4 max-w-[720px] mx-auto">
              Discover how ParentOS can simplify communication and collaboration for your child's care team in this short video.
            </p>
            <div className="aspect-video max-w-4xl mx-auto bg-muted rounded-lg">
              <iframe 
                className="w-full h-full rounded-lg shadow-lg border border-border"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="ParentOS Explainer Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          </section>

          {/* Key Features Section */}
          <section id="features" className="px-4 py-10">
            <div className="flex flex-col gap-4 mb-10">
              <h1 className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                Key Features
              </h1>
              <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">
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
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Testimonials</h2>
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

          {/* FAQ Section */}
          <section id="faq" className="px-4 py-10">
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-[720px] mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index+1}`} key={index}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-base text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section id="pricing" className="text-center px-4 py-10 @[480px]:px-10 @[480px]:py-20">
            <div className="flex flex-col gap-2 text-center max-w-[720px] mx-auto">
              <h1 className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                Get Started with ParentOS Today
              </h1>
              <p className="text-foreground text-base font-normal leading-normal mb-8">
                Sign up for free to start building a comprehensive timeline for your child. Upgrade to unlock powerful collaborative features and AI insights.
              </p>
            </div>
            <Button asChild className="h-10 px-4 @[480px]:h-12 @[480px]:px-5 text-sm @[480px]:text-base font-bold leading-normal tracking-[0.015em]">
              <Link to="/register">Get Started for Free</Link>
            </Button>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
