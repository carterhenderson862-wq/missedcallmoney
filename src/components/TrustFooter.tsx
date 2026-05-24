import { Link } from "react-router-dom";

const TrustFooter = () => {
  return (
    <footer className="py-10 text-center border-t border-border">
      <div className="container space-y-3">
        <p className="text-sm text-muted-foreground">
          Built for local service businesses. Simple, fast, and focused on helping you recover lost revenue.
        </p>
        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:support@callrecover.com"
            className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            support@callrecover.com
          </a>
        </p>
        <p className="text-sm flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            to="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Privacy
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Terms
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to="/sms-consent"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            SMS Consent
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default TrustFooter;
