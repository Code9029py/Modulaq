import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type TextLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

/**
 * Link inline para usar dentro de párrafos en páginas públicas.
 * Unifica el patrón que se repetía a mano en Privacy / ContactForm.
 *
 * Es un <a> nativo (acepta mailto: y URLs absolutas). Para navegación
 * interna React Router usá <Link> directamente.
 */
export function TextLink({ children, className, href }: TextLinkProps) {
  return (
    <a
      className={cn(
        "font-medium text-ink-700 underline underline-offset-2 transition hover:text-ink-900",
        className,
      )}
      href={href}
    >
      {children}
    </a>
  );
}
