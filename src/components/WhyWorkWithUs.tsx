import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface WhyWorkWithUsProps {
  reasons: string[];
  image?: string;
}

const WhyWorkWithUs = ({ reasons, image }: WhyWorkWithUsProps) => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase mb-12 relative inline-block"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary">Why work</span>
              <br />
              <span className="text-foreground">with us?</span>
              
              {/* Animated Underline */}
              <motion.div
                className="absolute -bottom-2 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.h2>

            <ul className="space-y-6">
              {reasons.map((reason, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-start gap-4 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="text-primary" size={28} />
                  </motion.div>
                  <span className="text-xl text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {reason}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl h-[600px]"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: image ? `url(${image})` : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-foreground)) 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyWorkWithUs;
