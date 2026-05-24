import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need to change my business phone number?",
    a: "No. You can forward missed calls to CallRecover or connect a dedicated number.",
  },
  {
    q: "What happens when I miss a call?",
    a: "The customer gets an instant text, the AI asks what they need, and the lead gets organized in your dashboard.",
  },
  {
    q: "Does this replace my staff?",
    a: "No. It backs them up when nobody answers, so missed calls still get a fast response.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts.",
  },
  {
    q: "What businesses is this for?",
    a: "Plumbers, HVAC companies, roofers, electricians, landscapers, pest control, and other service businesses.",
  },
  {
    q: "What does it cost?",
    a: "CallRecover starts with a 7-day free trial, then $249/month. One recovered job can cover your month.",
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

          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-2">
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
