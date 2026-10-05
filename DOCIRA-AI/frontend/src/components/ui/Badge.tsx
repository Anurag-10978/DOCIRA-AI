import type { ReactNode } from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default";

const variants: Record<BadgeVariant, string> = {
  success:
    "bg-success/15 text-success border-success/30",

  warning:
    "bg-warning/15 text-warning border-warning/30",

  danger:
    "bg-danger/15 text-danger border-danger/30",

  info:
    "bg-accent/15 text-accent border-accent/30",

  default:
    "surface-ghost text-text-secondary border-border",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}