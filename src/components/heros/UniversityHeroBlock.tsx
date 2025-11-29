import { motion } from "framer-motion";
import { fadeLeft, fadeRight, staggerContainer, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";

interface UniversityHeroBlockProps {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  images: string[];
  ctaText?: string;
  onCtaClick?: () => void;
}

export const UniversityHeroBlock = ({
  title,
  subtitle = "– SSG",
  paragraphs,
  images,
  ctaText,
  onCtaClick,
}: UniversityHeroBlockProps) => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left Block - Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeLeft}
            className="bg-background p-8 md:p-12 rounded-2xl lg:sticky lg:top-24 h-fit"
          >
            <motion.h1
              variants={staggerItem}
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-black tracking-wide uppercase text-foreground mb-4"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-primary text-sm md:text-base font-bold tracking-widest uppercase mb-8"
            >
              {subtitle}
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="space-y-6"
            >
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  variants={staggerItem}
                  className="text-lg md:text-xl text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>

            {ctaText && (
              <motion.div
                variants={staggerItem}
                className="mt-10"
              >
                <Button
                  onClick={onCtaClick}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-background font-bold tracking-wider uppercase px-8 py-6 text-lg"
                >
                  {ctaText}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Right Block - Image Slideshow */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeRight}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative aspect-[6/4] rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl hover:border-primary/50 transition-all duration-300"
                >
                  <img
                    src={image}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
