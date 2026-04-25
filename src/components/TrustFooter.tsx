import { Link } from "react-router-dom";

const TrustFooter = () => {
  return (
    <div className="py-8 text-center border-t border-border">
      <div className="container space-y-3">
        <p className="text-sm text-muted-foreground">
          Built for local service businesses. Simple, fast, and focused on helping you recover lost revenue.
        </p>
        <p className="text-sm">
          <Link
            to="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TrustFooter;
