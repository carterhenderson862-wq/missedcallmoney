import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <Phone className="w-5 h-5 text-primary" />
          <span>CallRecover</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-display font-medium">
              Dashboard
            </Button>
          </Link>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground font-display font-medium shadow-glow hover:opacity-90 transition-opacity">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
