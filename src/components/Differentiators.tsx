import { motion } from "framer-motion";

const Differentiators = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Unlike basic missed-call text tools, this system{" "}
            <span className="text-foreground font-semibold">
              continues the conversation and pushes toward booking
            </span>{" "}
            until the job is secured.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiators;
