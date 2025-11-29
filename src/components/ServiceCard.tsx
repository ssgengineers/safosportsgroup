import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, icon, delay = 0, onClick }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
    >
      <Card 
        onClick={onClick}
        className="relative p-8 h-full bg-card border-2 border-border hover:border-primary transition-all duration-500 cursor-pointer group overflow-hidden"
      >
        {/* Hover background fill */}
        <motion.div
          className="absolute inset-0 bg-primary/5 -z-0"
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ transformOrigin: "bottom" }}
        />

        <div className="relative z-10">
          {/* Icon */}
          {icon && (
            <motion.div
              className="mb-6 text-primary"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-5xl">
                {icon}
              </div>
            </motion.div>
          )}

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-wide uppercase group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          {/* Arrow Icon */}
          <motion.div
            className="flex items-center text-primary"
            initial={{ x: 0 }}
            whileHover={{ x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight 
              size={32} 
              className="group-hover:animate-pulse"
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
