import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Phone className="w-5 h-5 text-primary" />
          <span>CallRecover</span>
        </Link>
        <span className="text-sm text-muted-foreground font-medium">Agent Dashboard</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
