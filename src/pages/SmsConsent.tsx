import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SmsConsent = () => {
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
          SMS Consent &amp; Messaging Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Last updated: 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              How consent is given
            </h2>
            <p className="text-muted-foreground">
              Customers may receive SMS messages from CallRecover-powered service businesses only after they initiate contact by calling the business phone number or submitting a service request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Purpose of messages
            </h2>
            <p className="text-muted-foreground">
              These messages are used for missed-call follow-up, service request questions, scheduling, appointment confirmation, and appointment follow-up.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Message frequency &amp; rates
            </h2>
            <p className="text-muted-foreground">
              Message frequency varies based on the customer interaction. Message and data rates may apply.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Opt-out and help
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Reply <span className="font-semibold text-foreground">STOP</span> to opt out at any time.</li>
              <li>Reply <span className="font-semibold text-foreground">HELP</span> for help.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              No marketing messages
            </h2>
            <p className="text-muted-foreground">
              No marketing or promotional messages are sent unless separately agreed to.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Data use
            </h2>
            <p className="text-muted-foreground">
              Customer phone numbers and message content are used only for service communication and scheduling. We do not sell or share customer data for marketing.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="font-display text-2xl font-semibold mb-4">More</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/" className="text-primary hover:underline font-medium">
                  Back to Home
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SmsConsent;
