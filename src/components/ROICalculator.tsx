import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const ROICalculator = () => {
  const [missedCalls, setMissedCalls] = useState(10);
  const [avgJobValue, setAvgJobValue] = useState(300);
  const [recoveryRate, setRecoveryRate] = useState(35);

  const monthlyRevenue = Math.round(
    missedCalls * 4.33 * avgJobValue * (recoveryRate / 100)
  );

  return (
    <section className="py-[60px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Calculate your <span className="text-gradient">lost revenue</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            See how much you're leaving on the table from missed calls.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto rounded-2xl bg-card p-8 md:p-12"
          style={{ border: "0.5px solid hsl(var(--border))" }}
        >
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-display font-semibold text-foreground">
                  Missed calls per week
                </label>
                <span className="font-display text-2xl font-bold text-primary">
                  {missedCalls}
                </span>
              </div>
              <Slider
                value={[missedCalls]}
                onValueChange={(v) => setMissedCalls(v[0])}
                min={1}
                max={30}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-display font-semibold text-foreground">
                  Average job value
                </label>
                <span className="font-display text-2xl font-bold text-primary">
                  ${avgJobValue}
                </span>
              </div>
              <Slider
                value={[avgJobValue]}
                onValueChange={(v) => setAvgJobValue(v[0])}
                min={100}
                max={2000}
                step={25}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-display font-semibold text-foreground">
                  Recovery rate
                </label>
                <span className="font-display text-2xl font-bold text-primary">
                  {recoveryRate}%
                </span>
              </div>
              <Slider
                value={[recoveryRate]}
                onValueChange={(v) => setRecoveryRate(v[0])}
                min={10}
                max={60}
                step={1}
              />
            </div>

            <div className="border-t border-border pt-8 text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Estimated monthly revenue recovered
              </div>
              <div className="font-display text-5xl md:text-6xl font-bold text-emerald-400">
                ${monthlyRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ROICalculator;
