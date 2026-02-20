import React from "react";

const variants = {
  primary:
    "bg-ds-accent text-stone-950 font-semibold shadow-ds-sm hover:bg-ds-accent-hover hover:shadow-ds-md active:scale-[0.98] transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg",
  secondary:
    "border border-ds-border-strong bg-ds-surface text-ds-text font-medium hover:bg-ds-surface-hover transition-all duration-250 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg",
  accent:
    "bg-ds-accent/90 text-stone-950 font-semibold shadow-ds-sm hover:bg-ds-accent hover:shadow-ds-md active:scale-[0.98] transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg",
  ghost:
    "text-ds-text-muted font-medium hover:bg-ds-surface-hover hover:text-ds-text active:scale-[0.98] transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-border focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg",
  danger:
    "bg-red-500/90 text-white font-semibold shadow-ds-sm hover:bg-red-500 hover:shadow-ds-md active:scale-[0.98] transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg",
};

const sizes = {
  sm: "rounded-ds-md px-3 py-2 text-ds-body-sm",
  md: "rounded-ds-xl px-5 py-3 text-ds-body",
  lg: "min-h-[3rem] rounded-ds-xl px-6 py-3.5 text-ds-heading",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  isLoading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center gap-2 font-display disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
