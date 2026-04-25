import { Phone } from "lucide-react";

const Navbar = () => {
  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <Phone className="w-5 h-5 text-primary" />
          <span>CallRecover</span>
        </div>
        <a
          href="#pricing"
          onClick={handlePricingClick}
          className="text-sm font-display font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Pricing
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
