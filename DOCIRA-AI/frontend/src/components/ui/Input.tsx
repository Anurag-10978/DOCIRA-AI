import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}

        <input
          className={`
            w-full bg-bg-tertiary border border-border rounded-xl
            px-4 py-2.5
            text-text-primary
            placeholder-text-muted
            text-sm
            transition-all duration-200
            focus:outline-none
            focus:border-border-active
            focus:ring-1
            focus:ring-accent/30
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                : ""
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}