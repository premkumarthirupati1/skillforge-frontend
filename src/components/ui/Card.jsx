import React from "react";
import { motion } from "framer-motion";

export default function Card({
  children,
  variant = "glass",
  hover = true,
  glow = false,
  className = "",
  onClick,
  ...props
}) {
  const base = "relative rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variants = {
    glass: "glass-card",
    elevated: "glass-card-elevated shadow-glass",
    outline: "bg-brand-surface/40 border border-brand-border/80 backdrop-blur-md",
    flat: "bg-brand-surface border border-brand-border",
  };

  const hoverStyles = hover
    ? "hover:border-brand-primary/40 hover:shadow-glow-primary/20 hover:-translate-y-0.5"
    : "";

  const glowStyles = glow ? "border-glow" : "";

  return (
    <motion.div
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.glass} ${hoverStyles} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
