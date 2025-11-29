import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopItem {
  id: string;
  title: string;
  image: string;
  price?: string;
  description?: string;
}

interface ShopCarouselProps {
  items: ShopItem[];
}

const ShopCarousel = ({ items }: ShopCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;

  const next = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black tracking-wider uppercase mb-4">
            SSG <span className="text-primary">SHOP</span>
          </h2>
          <p className="text-xl text-muted-foreground">Exclusive athlete merchandise</p>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            onClick={prev}
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ChevronLeft size={24} />
          </Button>

          <Button
            onClick={next}
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ChevronRight size={24} />
          </Button>

          {/* Carousel Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {visibleItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${currentIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  {/* Image Container */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg mb-4 aspect-square bg-card"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ 
                        backgroundImage: item.image ? `url(${item.image})` : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>

                  {/* Caption Bar */}
                  <div className="bg-background border-2 border-border group-hover:border-primary transition-all duration-300 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg tracking-wide uppercase">{item.title}</h3>
                      {item.price && (
                        <p className="text-primary font-bold">{item.price}</p>
                      )}
                    </div>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="text-primary" size={24} />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCarousel;
