
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">© {new Date().getFullYear()} ParentOS. All rights reserved.</p>
          <div className="flex gap-6 order-1 md:order-2">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
             <a href="mailto:contact@parentos.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
