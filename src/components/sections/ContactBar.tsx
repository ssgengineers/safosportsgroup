import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { scaleIn, hoverScale } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ContactBarProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: "yellow" | "black";
}

export const ContactBar = ({
  title = "Ready to Get Started?",
  description = "Join thousands of athletes and brands already using SSG to create meaningful partnerships.",
  primaryButtonText = "Sign Up as Athlete",
  primaryButtonLink = "/athlete-intake",
  secondaryButtonText = "Sign Up as Brand",
  secondaryButtonLink = "/brand-intake",
  backgroundColor = "yellow",
}: ContactBarProps) => {
  const bgClass = backgroundColor === "yellow" ? "bg-primary" : "bg-background";
  const textClass = backgroundColor === "yellow" ? "text-background" : "text-foreground";

  return (
    <section className={`py-20 md:py-28 ${bgClass}`}>
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase mb-6 ${textClass}`}>
            {title}
          </h2>
          <p className={`text-lg md:text-xl leading-relaxed mb-10 ${backgroundColor === "yellow" ? "text-background/90" : "text-muted-foreground"}`}>
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <Link to={primaryButtonLink}>
                <Button
                  size="lg"
                  className={`${
                    backgroundColor === "yellow"
                      ? "bg-background text-primary hover:bg-background/90"
                      : "bg-primary text-background hover:bg-primary/90"
                  } font-bold tracking-wider uppercase px-8 py-6 text-lg group`}
                >
                  {primaryButtonText}
                  <motion.div
                    variants={{
                      rest: { x: 0 },
                      hover: { x: 5 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="inline-block ml-2"
                  >
                    <ArrowRight className="w-5 h-5 inline" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <Link to={secondaryButtonLink}>
                <Button
                  size="lg"
                  className={`${
                    backgroundColor === "yellow"
                      ? "bg-background text-primary hover:bg-background/90"
                      : "bg-primary text-background hover:bg-primary/90"
                  } font-bold tracking-wider uppercase px-8 py-6 text-lg group`}
                >
                  {secondaryButtonText}
                  <motion.div
                    variants={{
                      rest: { x: 0 },
                      hover: { x: 5 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="inline-block ml-2"
                  >
                    <ArrowRight className="w-5 h-5 inline" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
