import { Check } from "lucide-react";

const trades = ["Plumbers", "HVAC companies", "Roofers", "Electricians", "Landscapers", "Pest Control"];

const BuiltFor = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
            Built for:
          </h2>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {trades.map((trade) => (
              <div
                key={trade}
                className="flex items-center gap-2 text-lg text-foreground"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                {trade}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltFor;
