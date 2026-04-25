import { LogOut, Phone, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Phone className="w-5 h-5 text-primary" />
          <span>CallRecover</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className={cn("text-sm font-medium transition-colors hover:text-foreground", location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground")}
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className={cn("text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1", location.pathname === "/settings" ? "text-foreground" : "text-muted-foreground")}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
