
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Info, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LegalPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Legal Information</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Important terms and conditions for using ParentOS.
          </p>

          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By using ParentOS, you agree to our terms and conditions. These terms govern your access to and use of our services. It's important to read them carefully. The service is provided "as is" without warranties of any kind. We are not responsible for any decisions made based on the information provided by our AI models. This platform is a tool to assist caregivers, not a replacement for professional medical, educational, or legal advice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Info className="h-8 w-8 text-primary" />
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ParentOS is an informational tool and is not intended to provide medical, legal, or educational advice. The AI-generated insights are based on patterns in the data provided and should not be considered as diagnoses or professional recommendations. Always consult with a qualified professional for any health, developmental, or legal concerns regarding your child.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <List className="h-8 w-8 text-primary" />
                <CardTitle>Acceptable Use Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Users are expected to use ParentOS responsibly. You agree not to upload malicious content, attempt to breach our security measures, or use the service for any illegal purposes. We reserve the right to suspend or terminate accounts that violate these policies.
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

export default LegalPage;
