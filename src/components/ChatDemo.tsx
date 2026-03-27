import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Bot, User, Send } from "lucide-react";

interface Message {
  role: "bot" | "customer";
  text: string;
  delay: number;
}

const conversation: Message[] = [
  { role: "bot", text: "Hey—this is Austin Plumbing. Sorry we missed your call. What's going on?", delay: 0 },
  { role: "customer", text: "My AC isn't working", delay: 1400 },
  { role: "bot", text: "Got it—is it completely out or just not cooling well?", delay: 2800 },
  { role: "customer", text: "Completely out", delay: 4200 },
  { role: "bot", text: "Okay—that's urgent. We can get someone out today. Are you available this afternoon?", delay: 5600 },
  { role: "customer", text: "Yes", delay: 7000 },
  { role: "bot", text: "Perfect—you're booked for 3pm today. 🔧", delay: 8400 },
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
          <p className="text-primary font-display font-semibold text-lg mb-3">
            Example: $300+ job recovered from a missed call
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Watch a <span className="text-gradient">$500 job</span> get booked
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Missed call → urgent AC repair → booked in under 60 seconds. No staff needed.
          </p>
        </motion.div>

        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
                <div className="font-display font-semibold text-sm">Austin Plumbing AI</div>
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
          <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
            This happens automatically every time you miss a call.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemo;
