import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface TriplePanelHeroProps {
  leftImage?: string;
  middleVideo?: string;
  rightVideo?: string;
  mainTitle: string;
  leftPanelText?: string;
  middlePanelText?: string;
  rightPanelText?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
}

const TriplePanelHero = ({
  leftImage,
  middleVideo,
  rightVideo,
  mainTitle,
  leftPanelText,
  middlePanelText,
  rightPanelText,
  ctaText = "JOIN NOW",
  onCtaClick,
}: TriplePanelHeroProps) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex">
      {/* Left Panel - Image */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative flex-1 h-full overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: leftImage ? `url(${leftImage})` : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
          }}
        >
          {/* Yellow tint overlay for SSG branding */}
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        </div>
        
        {leftPanelText && (
          <div className="relative z-10 h-full flex items-end justify-center pb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-[0.2em] text-center leading-tight"
            >
              {leftPanelText}
            </motion.h2>
          </div>
        )}
      </motion.div>

      {/* Middle Panel - Blurred Video */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="relative flex-1 h-full overflow-hidden"
      >
        {middleVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover blur-sm brightness-75"
          >
            <source src={middleVideo} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-card to-muted blur-sm brightness-75" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        
        {middlePanelText && (
          <div className="relative z-10 h-full flex items-end justify-center pb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-[0.2em] text-center leading-tight"
            >
              {middlePanelText}
            </motion.h2>
          </div>
        )}
      </motion.div>

      {/* Right Panel - Clear Video */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative flex-1 h-full overflow-hidden"
      >
        {rightVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-90"
          >
            <source src={rightVideo} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-bl from-card via-muted to-card brightness-90" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
        
        {rightPanelText && (
          <div className="relative z-10 h-full flex items-end justify-center pb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-[0.2em] text-center leading-tight px-8"
            >
              {rightPanelText}
            </motion.h2>
          </div>
        )}
      </motion.div>

      {/* Centered Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center px-6"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.15em] text-foreground uppercase mb-12 leading-tight pointer-events-auto">
            {mainTitle}
          </h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="pointer-events-auto"
          >
            <Button
              onClick={onCtaClick}
              size="lg"
              className="bg-transparent border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary text-lg px-12 py-6 tracking-[0.2em] font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,211,0,0.5)]"
            >
              {ctaText}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-foreground rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-foreground rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TriplePanelHero;
