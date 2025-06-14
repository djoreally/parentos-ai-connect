
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="flex justify-center border-t border-border bg-background">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <div className="flex flex-col gap-6 px-5 py-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-base font-normal text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal" className="text-base font-normal text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:contact@parentos.com" className="text-base font-normal text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>
          <p className="text-base font-normal text-muted-foreground">© {new Date().getFullYear()} ParentOS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
