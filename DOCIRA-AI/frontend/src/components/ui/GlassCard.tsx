import type { ReactNode} from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({
  children,
  className = "",
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
    className={`glass-card rounded-xl2 ${
      glow ? "glow-accent" : ""
    } ${className}`}
    {...props}
  >
      {children}
    </div>
  );
}