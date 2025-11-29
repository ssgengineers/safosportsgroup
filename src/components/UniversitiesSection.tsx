import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface UniversitiesSectionProps {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  images: string[];
  imagePosition?: "left" | "right";
  backgroundColor?: "white" | "yellow" | "black";
}

const UniversitiesSection = ({
  title,
  subtitle,
  paragraphs,
  images,
  imagePosition = "right",
  backgroundColor = "white",
}: UniversitiesSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const bgClass = 
    backgroundColor === "yellow" ? "bg-primary/10" :
    backgroundColor === "black" ? "bg-background" :
    "bg-card/30";

  const textColorClass = backgroundColor === "black" ? "text-foreground" : "text-foreground";

  return (
    <section className={`py-32 ${bgClass}`}>
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${imagePosition === "left" ? "lg:flex-row-reverse" : "lg:flex-row"} gap-16 items-center`}>
          {/* Text Block */}
          <motion.div
            initial={{ opacity: 0, x: imagePosition === "left" ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`flex-1 ${textColorClass}`}
          >
            <div className="bg-background p-12 rounded-2xl shadow-2xl">
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4"
                >
                  — {subtitle}
                </motion.p>
              )}
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase mb-8 leading-tight"
              >
                {title}
              </motion.h2>

              <div className="space-y-6">
                {paragraphs.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-lg text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Image Slideshow */}
          <motion.div
            initial={{ opacity: 0, x: imagePosition === "left" ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{
                    opacity: currentImageIndex === index ? 1 : 0,
                    scale: currentImageIndex === index ? 1 : 1.1,
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: image ? `url(${image})` : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)',
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Decorative Dot */}
              <motion.div
                className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-muted opacity-30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? "bg-primary w-8"
                        : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UniversitiesSection;
