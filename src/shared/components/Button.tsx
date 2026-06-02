import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-900 text-surface-50 shadow-panel hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-soft motion-reduce:hover:translate-y-0",
  secondary:
    "border border-surface-200/80 bg-surface-50/80 text-ink-900 shadow-sm hover:-translate-y-0.5 hover:border-accent-cyan/45 hover:bg-surface-100 hover:shadow-panel motion-reduce:hover:translate-y-0",
  ghost: "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
};

export function Button({
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  children,
  className,
  disabled = false,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
    variants[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );

  if (href) {
    return (
      <Link to={href} className={buttonClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      type={type}
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
