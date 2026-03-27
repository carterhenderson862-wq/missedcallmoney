import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, User, Send, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "bot" | "customer";
  text: string;
  time: string;
}

const conversation: Message[] = [
  { role: "bot", text: "Hey! This is Austin Plumbing 👋 Sorry we missed your call — what's going on?", time: "2:14 PM" },
  { role: "customer", text: "My AC isn't working", time: "2:14 PM" },
  { role: "bot", text: "Oh no, is it totally out or just not blowing cold?", time: "2:15 PM" },
  { role: "customer", text: "Completely out", time: "2:15 PM" },
  { role: "bot", text: "Ugh that's rough, especially in this heat 😅 We actually have a slot open today — would this afternoon work for you?", time: "2:16 PM" },
  { role: "customer", text: "Yes", time: "2:16 PM" },
  { role: "bot", text: "Perfect! Locking you in for 3pm. You'll get a confirmation text shortly 👍", time: "2:17 PM" },
];

const ChatDemo = () => {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showBooked, setShowBooked] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasPlayedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isTyping, showBooked]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const playConversation = useCallback(() => {
    clearTimeouts();
    setVisibleMessages(0);
    setIsTyping(false);
    setShowBooked(false);
    hasPlayedRef.current = true;

    let cumulativeDelay = 400;

    conversation.forEach((msg, i) => {
      if (msg.role === "bot") {
        const typingDelay = i === 0 ? 800 : 1200 + Math.random() * 800;
        const t1 = setTimeout(() => setIsTyping(true), cumulativeDelay);
        timeoutsRef.current.push(t1);
        cumulativeDelay += typingDelay;
      } else {
        cumulativeDelay += 600 + Math.random() * 400;
      }

      const t2 = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(i + 1);
      }, cumulativeDelay);
      timeoutsRef.current.push(t2);

      cumulativeDelay += 400;
    });

    const t3 = setTimeout(() => {
      setShowBooked(true);
    }, cumulativeDelay + 600);
    timeoutsRef.current.push(t3);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayedRef.current) {
          playConversation();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [playConversation]);

  const handleReplay = () => {
    playConversation();
  };

  return (
    <section className="py-[60px] bg-card">
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
              <AnimatePresence mode="popLayout">
                {conversation.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div
                    key={`msg-${i}`}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex flex-col ${msg.role === "customer" ? "items-end" : "items-start"}`}
                  >
                    <div className={`flex gap-2.5 ${msg.role === "customer" ? "justify-end" : "justify-start"}`}>
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
                    </div>
                    <span className={`text-[10px] text-muted-foreground/60 mt-1 ${msg.role === "customer" ? "mr-10" : "ml-10"}`}>
                      {msg.time}
                    </span>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
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

                {/* Job Booked badge */}
                {showBooked && (
                  <motion.div
                    key="booked"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex justify-center pt-2"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-5 py-2 text-sm font-display font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Job Booked ✓
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
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

          {/* Replay + CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {showBooked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReplay}
                  className="font-display font-medium text-sm px-6 py-5 border-border hover:bg-secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Replay Demo
                </Button>
              </motion.div>
            )}
            <a href="#cta">
              <Button
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-8 py-6 shadow-glow hover:opacity-90 transition-opacity"
              >
                Get This Working For Your Business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemo;
