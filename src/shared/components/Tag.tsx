import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type TagProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Etiqueta chica neutra para metadata (categoría, pricing, modos, etc.).
 * Reemplaza al SmallBadge inline de ToolCard. Pensado para usarse en grupos
 * dentro de cards/paneles del sistema visual Post-V3 / Fase A.
 */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-surface-200/80 bg-surface-50/90 px-2.5 py-1 text-xs font-semibold text-ink-700 shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
