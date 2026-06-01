import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SmsOptInFlow = () => {
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
          SMS Opt-In Flow
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          This page documents how end users consent to SMS messages from CallRecover-powered service businesses, for A2P 10DLC review.
        </p>

        <div className="space-y-10 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              How customers opt in
            </h2>
            <p className="text-muted-foreground">
              Customers opt in by initiating contact with a CallRecover-powered service business. This happens when a customer calls the business phone number or submits a service request asking for help.
            </p>
            <p className="text-muted-foreground mt-3">
              When a customer calls the business phone number and the call is missed, CallRecover may send an SMS message related to that customer's service request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Example phone presentation
            </h2>
            <p className="text-muted-foreground">
              Business phone number:{" "}
              <span className="font-semibold text-foreground">+1 737 271 1871</span>
            </p>
            <p className="text-muted-foreground mt-3">
              Customers see the business phone number on the business website, Google Business Profile, ads, or service request page before calling.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              SMS disclosure shown to customers
            </h2>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
              "By calling this business or submitting a service request, you agree to receive SMS messages from CallRecover related to missed-call follow-up, service questions, scheduling, appointment confirmation, and appointment follow-up. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. No marketing messages are sent."
            </blockquote>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Opt-out and help keywords
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Opt-out keywords:{" "}
                <span className="font-semibold text-foreground">
                  STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT
                </span>
              </li>
              <li>
                Help keyword:{" "}
                <span className="font-semibold text-foreground">HELP</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Verbal consent script
            </h2>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
              "Thank you for calling. To help with your service request, we may send you SMS messages for appointment details and follow-up. Message and data rates may apply. You can reply STOP at any time to unsubscribe or HELP for assistance. We do not send marketing messages or share your mobile information for marketing purposes. Do you consent to receive these messages?"
            </blockquote>
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
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/sms-consent" className="text-primary hover:underline font-medium">
                  SMS Consent
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SmsOptInFlow;
