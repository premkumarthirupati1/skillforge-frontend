import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Modern High-Performance Action Button
 * Variants: primary | secondary | glow | ghost | danger | outline
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50";

  const sizeStyles = {
    xs: "text-xs px-2.5 py-1 rounded-lg gap-1.5 h-7",
    sm: "text-xs px-3.5 py-1.5 rounded-lg gap-2 h-8",
    md: "text-sm px-4 py-2 rounded-xl gap-2 h-10",
    lg: "text-base px-6 py-2.5 rounded-xl gap-2.5 h-12",
  };

  const variantStyles = {
    primary: "bg-brand-primary hover:bg-brand-secondary text-white shadow-sm shadow-brand-primary/30 hover:shadow-brand-primary/40 border border-white/10",
    glow: "bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-cyan text-white shadow-glow-primary hover:shadow-glow-cyan border border-white/20 font-semibold",
    secondary: "bg-brand-surface hover:bg-brand-elevated text-brand-text border border-brand-border hover:border-brand-primary/40 shadow-sm",
    ghost: "bg-transparent hover:bg-brand-surface/70 text-brand-muted hover:text-brand-text border border-transparent",
    outline: "bg-transparent text-brand-primary border border-brand-primary/40 hover:bg-brand-primary/10",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
}
