import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  link?: string;
}

interface ServicesSectionProps {
  title?: string;
  services: Service[];
  columns?: 2 | 3 | 4;
  backgroundColor?: "black" | "yellow" | "white";
}

export const ServicesSection = ({
  title = "Our Services",
  services,
  columns = 3,
  backgroundColor = "black",
}: ServicesSectionProps) => {
  const bgColor = {
    black: "bg-background",
    yellow: "bg-primary",
    white: "bg-white",
  }[backgroundColor];

  const textColor = {
    black: "text-foreground",
    yellow: "text-background",
    white: "text-background",
  }[backgroundColor];

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <section className={`py-24 md:py-32 ${bgColor} transition-colors duration-1000`}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`font-heading text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase ${textColor}`}>
            {title}
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`grid grid-cols-1 ${gridCols} gap-8`}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={staggerItem}
              initial="rest"
              whileHover="hover"
              className="group relative bg-card border border-border rounded-lg p-8 overflow-hidden cursor-pointer hover-lift-card gradient-overlay-yellow"
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-400 -z-10" />

              {/* Icon */}
              <motion.div
                className="mb-6"
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.1, rotate: 5 },
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
              </motion.div>

              {/* Content */}
              <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-wide uppercase mb-4 text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Arrow with rotation animation */}
              <motion.div
                className="flex items-center gap-2 text-primary font-semibold"
                variants={{
                  rest: { x: 0 },
                  hover: { x: 8 },
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="uppercase tracking-wide text-sm">Learn More</span>
                <motion.div
                  variants={{
                    rest: { rotate: 0 },
                    hover: { rotate: 45 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.div>

              {/* Border glow effect on hover */}
              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-lg transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
