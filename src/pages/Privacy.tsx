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
          Last updated: 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              What data we collect
            </h2>
            <p className="text-muted-foreground">
              We collect only the information needed to provide the service:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
              <li>Customer name (when provided)</li>
              <li>Phone numbers of callers and customers</li>
              <li>Business details supplied by you (business name, service area, services, hours, pricing)</li>
              <li>SMS message content exchanged between you, your customers, and our system</li>
              <li>Service request details (e.g. service type, location, urgency)</li>
              <li>Appointment preferences and scheduling information</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              How we use your data
            </h2>
            <p className="text-muted-foreground">
              Your data is used solely to provide the service: service communication, scheduling,
              missed-call lead recovery, appointment confirmation and follow-up, customer support,
              and ongoing product operation. We do not use your data for advertising or profiling.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              We do not sell or share your data
            </h2>
            <p className="text-muted-foreground">
              Mobile information (including phone numbers and SMS content) is never sold, rented,
              or shared with third parties for marketing or promotional purposes. The only
              third-party services involved are the infrastructure providers required to deliver
              SMS messages and host the application (e.g. our messaging and cloud providers), and
              they only process data on our behalf.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Data security
            </h2>
            <p className="text-muted-foreground">
              Data is stored on secured cloud infrastructure with row-level access controls so
              each business can only access its own leads, messages, and settings. Access keys
              and credentials are kept in server-side secret storage and are not exposed to the
              browser.
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
              Questions about privacy? Email us at{" "}
              <a href="mailto:support@callrecover.com" className="text-primary hover:underline font-medium">
                support@callrecover.com
              </a>{" "}
              and we'll respond promptly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
