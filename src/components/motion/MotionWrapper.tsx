import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animations";

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MotionWrapper = ({ children, className = "" }: MotionWrapperProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};
