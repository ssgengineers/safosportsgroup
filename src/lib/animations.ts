import { Variants } from "framer-motion";

// Fade direction animations
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const fadeDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const fadeRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const scaleUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Hover effects
export const hoverLift = {
  rest: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    y: -8,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const hoverScale = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const hoverGlow = {
  rest: {
    boxShadow: "0 0 0 0 rgba(255, 211, 0, 0)",
  },
  hover: {
    boxShadow: "0 0 20px 4px rgba(255, 211, 0, 0.4)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Button animations
export const buttonPulse: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(255, 211, 0, 0.7)",
  },
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(255, 211, 0, 0.7)",
      "0 0 0 10px rgba(255, 211, 0, 0)",
      "0 0 0 0 rgba(255, 211, 0, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Stagger configurations
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const staggerFastContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// Panel animations (for hero)
export const panelSlideLeft: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const panelSlideRight: Variants = {
  hidden: {
    x: 100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const panelSlideUp: Variants = {
  hidden: {
    y: 50,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Arrow rotation (for cards)
export const arrowRotate = {
  rest: {
    rotate: 0,
  },
  hover: {
    rotate: 45,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Border glow animation
export const borderGlow = {
  rest: {
    borderColor: "rgba(255, 211, 0, 0.2)",
  },
  hover: {
    borderColor: "rgba(255, 211, 0, 1)",
    boxShadow: "0 0 20px rgba(255, 211, 0, 0.5)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Scroll indicator (bounce animation)
export const scrollIndicator: Variants = {
  animate: {
    y: [0, 10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Text reveal animations
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// Image reveal with blur
export const imageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Infinite scroll animation helper (for CSS)
export const infiniteScrollAnimation = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 30,
        ease: "linear",
      },
    },
  },
};

// Card fill animation
export const cardFill = {
  rest: {
    background: "transparent",
  },
  hover: {
    background: "linear-gradient(135deg, rgba(255, 211, 0, 0.1) 0%, rgba(255, 211, 0, 0.05) 100%)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Navbar scroll animations
export const navbarScroll = {
  top: {
    height: "80px",
    backgroundColor: "rgba(0, 0, 0, 0)",
    boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
  },
  scrolled: {
    height: "60px",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};
