import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type HeroBadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
};

/**
 * Badge superior usado como pre-título de las páginas públicas (Beta pública,
 * Catálogo, Contacto, Privacidad). Estilo unificado en Fase A: borde + fondo
 * translúcido, mayúsculas con tracking suave, ícono opcional a tamaño 15.
 */
export function HeroBadge({ children, className, icon: Icon }: HeroBadgeProps) {
  return (
    <p
      className={cn(
        "mb-2 inline-flex items-center gap-2 rounded-md border border-surface-200/80 bg-surface-50/80 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700 shadow-sm backdrop-blur",
        className,
      )}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </p>
  );
}
