"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface InteractionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

/**
 * Dandatto Hover: A subtle lift and scale effect for interactive elements.
 */
export function DandattoHover({ children, className, ...props }: InteractionProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Witty Entrance: A bouncy entrance for cards and modals.
 */
export function WittyEntrance({ children, delay = 0, ...props }: InteractionProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay, 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fish Jump: A quirky animation of a small element jumping up.
 * Just for that Dandatto "Soul".
 */
export function FishJump({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ 
        y: [0, -20, 0],
        rotate: [0, 15, -15, 0],
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
