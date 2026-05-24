import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Last updated: 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Service description
            </h2>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">CallRecover</span> is a missed-call
              recovery and SMS scheduling assistance service for local service businesses. The
              service automatically responds to missed calls on behalf of the business by sending
              SMS text messages to callers. It qualifies leads, answers basic questions, and helps
              schedule jobs through automated text conversations, with results visible in your
              dashboard.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Message frequency
            </h2>
            <p className="text-muted-foreground">
              Message frequency varies based on customer interaction. Messages are sent in response to missed
              calls and ongoing conversations between you and your customers. There is no fixed number of
              messages per day or month.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Messaging terms
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Message and data rates may apply.</li>
              <li>Reply <span className="font-semibold text-foreground">STOP</span> to opt out at any time.</li>
              <li>Reply <span className="font-semibold text-foreground">HELP</span> for support.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Acceptable use
            </h2>
            <p className="text-muted-foreground">
              You agree to use the service only for legitimate business communication with your own customers
              and prospective customers. You may not use the service to send unsolicited marketing, spam, or
              any unlawful content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Pricing, billing &amp; cancellation
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>7-day free trial — no card required to start.</li>
              <li>After the trial, the service is <span className="font-semibold text-foreground">$249/month</span>, billed monthly.</li>
              <li>No contracts. Cancel anytime; cancellation stops future charges and ends service at the end of the current billing period.</li>
              <li>No setup fees.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Call forwarding &amp; customer disclosure
            </h2>
            <p className="text-muted-foreground">
              Businesses using CallRecover are responsible for ensuring their customers understand
              that missed-call follow-up may be handled by CallRecover-powered SMS automation and
              that messages may be stored in the business dashboard for service follow-up.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Liability
            </h2>
            <p className="text-muted-foreground">
              The service is provided "as is" without warranties of any kind. We are not liable for missed
              messages, carrier delays, or business outcomes resulting from use of the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              SMS consent &amp; messaging policy
            </h2>
            <p className="text-muted-foreground">
              Customers may receive SMS messages from CallRecover-powered service businesses only after they initiate contact by calling the business phone number or submitting a service request. These messages are used for missed-call follow-up, service request questions, scheduling, appointment confirmation, and appointment follow-up. Message frequency varies based on the customer interaction. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help. No marketing or promotional messages are sent unless separately agreed to. Customer phone numbers and message content are used only for service communication and scheduling. We do not sell or share customer data for marketing.
            </p>
            <p className="text-muted-foreground mt-2">
              For the full policy, see{" "}
              <Link to="/sms-consent" className="text-primary hover:underline font-medium">
                SMS Consent &amp; Messaging Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions about these terms? Email us at{" "}
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

export default Terms;
