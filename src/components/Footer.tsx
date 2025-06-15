
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto py-6 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Parentrak. All rights reserved.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy & Your Rights
          </Link>
          <Link to="/legal" className="hover:text-primary transition-colors">
            Legal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
