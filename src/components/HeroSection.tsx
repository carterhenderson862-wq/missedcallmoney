import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import SocialProofBanner from "./SocialProofBanner";
import TrustBadges from "./TrustBadges";

const HeroSection = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85" />
        <div className="absolute inset-0 bg-gradient-glow" />
      </div>

      <div className="container relative z-10 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Turn missed calls into{" "}
            <span className="text-gradient">booked jobs</span> automatically.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto"
          >
            Miss a call → We text them → You get the job
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm text-muted-foreground/70 mb-6"
          >
            Most businesses miss 30% of their calls. That's lost revenue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-2 font-mono">Today's results</p>
            <div className="inline-block bg-card/40 border border-border/60 rounded-lg px-5 py-3 text-left font-mono">
              <span className="text-muted-foreground text-sm">3 missed calls</span>
              <span className="text-muted-foreground/30 mx-2">→</span>
              <span className="text-foreground font-bold text-sm">2 booked jobs</span>
              <span className="text-muted-foreground/30 mx-2">→</span>
              <span className="text-emerald-400 font-bold text-base">$600 recovered</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              onClick={onCTAClick}
              className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-8 py-6 shadow-glow hover:opacity-90 transition-opacity"
            >
              Try this on your next missed call
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground/60">
              Takes 2 minutes. Works with your current number. No setup headache.
            </p>
            <TrustBadges />
          </motion.div>

          <SocialProofBanner />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground/60"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Avg. response time: 28 seconds</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
