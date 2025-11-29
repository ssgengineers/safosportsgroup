import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";
import { ReactNode } from "react";

interface AlternatingContentSectionProps {
  imagePosition: "left" | "right";
  backgroundColor?: "white" | "yellow" | "black";
  image: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  content: string | ReactNode;
  stickyText?: boolean;
}

export const AlternatingContentSection = ({
  imagePosition,
  backgroundColor = "white",
  image,
  imageAlt = "",
  title,
  subtitle,
  content,
  stickyText = true,
}: AlternatingContentSectionProps) => {
  const bgColorClass = {
    white: "bg-white",
    yellow: "bg-primary",
    black: "bg-background",
  }[backgroundColor];

  const textColorClass = {
    white: "text-background",
    yellow: "text-background",
    black: "text-foreground",
  }[backgroundColor];

  const isImageLeft = imagePosition === "left";

  return (
    <section className={`py-16 md:py-24 ${bgColorClass} transition-colors duration-1000`}>
      <div className="container mx-auto px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isImageLeft ? "" : "lg:grid-flow-dense"}`}>

          {/* Image Block */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={isImageLeft ? fadeLeft : fadeRight}
            className={`relative ${isImageLeft ? "lg:col-start-1" : "lg:col-start-2"}`}
          >
            <div className="relative aspect-[6/4] rounded-3xl overflow-hidden border-8 border-primary shadow-2xl">
              <img
                src={image}
                alt={imageAlt || title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Text Block */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className={`${isImageLeft ? "lg:col-start-2" : "lg:col-start-1"} ${stickyText ? "lg:sticky lg:top-24" : ""}`}
          >
            {subtitle && (
              <motion.p
                variants={fadeUp}
                className="text-primary text-sm md:text-base font-bold tracking-widest uppercase mb-4"
              >
                {subtitle}
              </motion.p>
            )}

            <motion.h2
              variants={fadeUp}
              className={`font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase mb-6 ${textColorClass}`}
            >
              {title}
            </motion.h2>

            <motion.div
              variants={fadeUp}
              className={`text-lg md:text-xl leading-relaxed space-y-4 ${textColorClass === "text-background" ? "text-background/90" : "text-muted-foreground"}`}
            >
              {typeof content === "string" ? <p>{content}</p> : content}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
