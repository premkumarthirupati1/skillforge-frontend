import React from "react";

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  ...props
}) {
  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 rounded-md gap-1 font-medium",
    sm: "text-xs px-2.5 py-0.5 rounded-full gap-1.5 font-medium",
    md: "text-xs px-3 py-1 rounded-full gap-1.5 font-semibold",
  };

  const variantStyles = {
    default: "bg-brand-surface text-brand-muted border border-brand-border",
    primary: "bg-brand-primary/10 text-brand-primary border border-brand-primary/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    cyan: "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30",
    emerald: "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30",
    amber: "bg-brand-amber/10 text-brand-amber border border-brand-amber/30",
    red: "bg-red-500/10 text-red-400 border border-red-500/30",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  };

  const dotColors = {
    default: "bg-brand-muted",
    primary: "bg-brand-primary",
    indigo: "bg-indigo-400",
    cyan: "bg-brand-cyan",
    emerald: "bg-brand-emerald",
    amber: "bg-brand-amber",
    red: "bg-red-400",
    purple: "bg-purple-400",
  };

  return (
    <span
      className={`inline-flex items-center select-none ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
}
