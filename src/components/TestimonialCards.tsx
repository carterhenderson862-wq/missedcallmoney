const testimonials = [
  {
    quote:
      "I was on a roof and missed a call. CallRecover texted them back and booked a $450 gutter job before I even climbed down.",
    name: "Mike R.",
    trade: "Roofer",
    location: "Austin, TX",
    value: "$450",
  },
  {
    quote:
      "Had my hands in a slab leak and couldn't answer. The AI got the customer's info and booked a $380 repipe the same afternoon.",
    name: "Carlos D.",
    trade: "Plumber",
    location: "Phoenix, AZ",
    value: "$380",
  },
  {
    quote:
      "Missed 3 calls during a compressor swap. Two of them got booked automatically — one was a $620 full-system diagnostic.",
    name: "Sarah T.",
    trade: "HVAC Tech",
    location: "Nashville, TN",
    value: "$620",
  },
];

const TestimonialCards = () => {
  return (
    <section className="py-[60px] bg-secondary/60">
      <div className="container">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Real jobs, recovered
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          From contractors who stopped losing money to voicemail.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-card p-7 flex flex-col"
            >
              <p className="text-foreground leading-relaxed flex-1 mb-5 text-sm">
                "{t.quote}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold text-foreground text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.trade} · {t.location}
                  </div>
                </div>
                <span className="text-primary font-bold font-display text-lg">
                  {t.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCards;
