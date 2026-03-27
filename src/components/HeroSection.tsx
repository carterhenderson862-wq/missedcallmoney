import { motion } from "framer-motion";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85" />
        <div className="absolute inset-0 bg-gradient-glow" />
      </div>

      <div className="container relative z-10 py-24 md:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Phone className="w-3.5 h-3.5" />
              AI Revenue Recovery Agent
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Turn missed calls into{" "}
            <span className="text-gradient">booked jobs</span> automatically.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-3 max-w-2xl"
          >
            Miss a call → We text them → You get the job.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm text-muted-foreground/70 leading-relaxed mb-10 max-w-2xl"
          >
            Most businesses miss 30% of their calls. That's lost revenue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-8 py-6 shadow-glow hover:opacity-90 transition-opacity">
              See how this books jobs for you
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="font-display font-medium text-base px-8 py-6 border-border hover:bg-secondary">
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg"
          >
            {[
              { value: "93%", label: "Response rate" },
              { value: "2.4x", label: "More bookings" },
              { value: "<30s", label: "Avg reply time" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
