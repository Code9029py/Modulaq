import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type HeroPanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Panel grande de hero usado en las páginas públicas (Catálogo, Consultas,
 * Privacidad). Reusa la fórmula consolidada en Fase A: rounded-2xl,
 * gradient surface, ring + backdrop-blur, sombra suave y banda hairline
 * cyan superior.
 *
 * Home tiene un layout en grid distinto y no usa este componente.
 */
export function HeroPanel({ children, className }: HeroPanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-surface-200/70 bg-gradient-to-br from-surface-50/90 via-surface-50/75 to-surface-100/60 p-5 shadow-soft ring-1 ring-surface-50/80 backdrop-blur md:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent"
      />
      {children}
    </section>
  );
}
