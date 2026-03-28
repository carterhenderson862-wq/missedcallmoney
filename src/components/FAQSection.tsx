import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Does this change my phone number?",
    a: "No. CallRecover works alongside your existing phone number. Your customers keep calling the same number they always have — we just catch the ones you miss.",
  },
  {
    q: "What if the customer calls back?",
    a: "Great — you answer like normal. If you're still busy, we'll keep the text conversation going until they're booked or tell us to stop.",
  },
  {
    q: "Is this TCPA compliant?",
    a: "Yes. We only text people who called your business first. That's an established business relationship, and our messages are transactional, not promotional. We also honor opt-out requests immediately.",
  },
  {
    q: "How fast does the AI respond?",
    a: "On average, within 28 seconds of the missed call. The faster you respond, the more likely they book — and most competitors take hours or never respond at all.",
  },
  {
    q: "What trades does this work for?",
    a: "Any service business that books appointments: plumbing, HVAC, roofing, electrical, landscaping, pest control, cleaning, and more. If you miss calls and lose jobs, this works for you.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">
            Questions? We got you.
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-xl px-5 bg-card"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
