import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Bot, User, Send } from "lucide-react";

interface Message {
  role: "bot" | "customer";
  text: string;
  delay: number;
}

const conversation: Message[] = [
  { role: "bot", text: "Hi! I noticed we missed your call to ProFlow Plumbing. How can we help you today?", delay: 0 },
  { role: "customer", text: "Yeah, my water heater is leaking pretty bad. Needed someone to look at it.", delay: 1200 },
  { role: "bot", text: "Sorry to hear that — a leaking water heater definitely needs quick attention. Is the leak coming from the bottom of the tank or from a pipe connection?", delay: 2800 },
  { role: "customer", text: "Bottom of the tank. There's water pooling on the floor.", delay: 4600 },
  { role: "bot", text: "Got it. That usually means a replacement is needed. How old is the unit — do you know? And is it gas or electric?", delay: 6000 },
  { role: "customer", text: "It's gas, probably 12-15 years old.", delay: 7800 },
  { role: "bot", text: "Sounds like it's past its lifespan. We can get a tech out to assess and quote a replacement. We have availability tomorrow morning at 9am or afternoon at 2pm — which works better?", delay: 9200 },
  { role: "customer", text: "9am works. What's the cost for the visit?", delay: 11000 },
  { role: "bot", text: "The diagnostic visit is $49, which gets waived if you go ahead with the repair or replacement. I've got you booked for tomorrow at 9am. We'll send a confirmation text shortly! 🔧", delay: 12400 },
];

const ChatDemo = () => {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setHasPlayed(true);
          setVisibleMessages(0);

          conversation.forEach((_, i) => {
            setTimeout(() => setVisibleMessages(i + 1), conversation[i].delay + 600);
          });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPlayed]);

  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            See the agent <span className="text-gradient">in action</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A real example: missed call from a homeowner with a leaking water heater — booked in under 2 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => setIsInView(true)}
          className="max-w-lg mx-auto"
        >
          {/* Phone frame */}
          <div className="rounded-3xl border border-border bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/50">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">ProFlow Plumbing AI</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  Online · Avg reply &lt;30s
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="px-4 py-5 space-y-3 min-h-[420px] max-h-[480px] overflow-y-auto">
              <AnimatePresence>
                {conversation.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex gap-2.5 ${msg.role === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "customer"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === "customer" && (
                      <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center mt-0.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {visibleMessages > 0 && visibleMessages < conversation.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-3">
                <span className="text-sm text-muted-foreground flex-1">Type a message...</span>
                <Send className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Simulated conversation · Actual agent responses vary by business
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemo;
