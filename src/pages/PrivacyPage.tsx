
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, ShieldX, MessageSquareQuote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Your Privacy & Your Rights</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We are committed to protecting your data. Here’s how we handle information and respect your rights under regulations like HIPAA.
          </p>

          <div className="space-y-8">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <CardTitle>What We Do to Protect Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Data Anonymization:</strong> Before any of your logs are sent to third-party AI models for analysis, we run a "PHI Scrubbing" process. This automatically removes personal identifiers like your child's name to ensure only de-identified data is used for generating insights.
                  </li>
                  <li>
                    <strong>Secure Storage:</strong> All data you provide is stored in our secure Supabase database, which employs robust security measures. We manage access controls strictly to ensure only authorized users can view information.
                  </li>
                  <li>
                    <strong>Prototype Status:</strong> Currently, ParentOS is a prototype. We operate exclusively with test data and strongly advise against using real Protected Health Information (PHI) at this stage.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center gap-4">
                <ShieldX className="h-8 w-8 text-red-600" />
                <CardTitle>What We Do NOT Do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>
                        We <strong>do not</strong> send identifiable information like names or specific medical conditions to non-BAA-compliant AI services like OpenAI or Google Gemini.
                    </li>
                    <li>
                        We <strong>do not</strong> sell your data.
                    </li>
                    <li>
                        We <strong>do not</strong> send your child's records over insecure channels like standard email.
                    </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <MessageSquareQuote className="h-8 w-8 text-primary" />
                <CardTitle>Notification & Communication Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To protect your privacy, we follow a strict "in-app only" policy for sensitive data. We will never send Protected Health Information (PHI) or other sensitive details through external channels like email or push notifications.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Generic Notifications:</strong> Any notification you receive (e.g., "New log added") is designed to be a simple alert. It will not contain any specific data about your child.
                  </li>
                  <li>
                    <strong>Secure Viewing:</strong> You will always be prompted to log into our secure platform to view any details.
                  </li>
                  <li>
                    <strong>Reduced Risk:</strong> This practice significantly reduces the compliance burden under HIPAA and FERPA, as no sensitive information leaves our secure environment.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Right to Know</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You have a right to understand how your data is used. While this platform is not yet HIPAA-compliant for live medical data, our architecture is designed with these principles in mind. Full compliance, including signing Business Associate Agreements (BAAs) with our service providers like Supabase, is a prerequisite for handling real PHI in the future.
                    </p>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
