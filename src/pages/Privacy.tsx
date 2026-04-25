import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-10 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              What data we collect
            </h2>
            <p className="text-muted-foreground">
              We collect only the information needed to respond to missed calls on your behalf:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
              <li>Phone numbers of callers and customers</li>
              <li>SMS messages exchanged between you, your customers, and our system</li>
              <li>Basic job details shared during the conversation (e.g. service type, location, urgency)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              How we use your data
            </h2>
            <p className="text-muted-foreground">
              Your data is used solely to provide the service: sending automated text replies to missed calls,
              qualifying leads, booking jobs, and displaying conversations in your dashboard. We do not use your
              data for advertising or profiling.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              We do not sell or share your data
            </h2>
            <p className="text-muted-foreground">
              We never sell, rent, or share your data or your customers' data with third parties for marketing
              purposes. The only third-party services involved are the infrastructure providers required to
              deliver SMS messages (e.g. our messaging and hosting providers), and they only process data on
              our behalf.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Data retention &amp; deletion
            </h2>
            <p className="text-muted-foreground">
              You can request deletion of your account and associated conversation data at any time by
              contacting us. Once deleted, your data is permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions about privacy? Reach out and we'll respond promptly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
