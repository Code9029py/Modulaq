import { cn } from "../utils/cn";

type PageBackdropTone = "cyan-mint" | "cyan-violet";

type PageBackdropProps = {
  className?: string;
  tone?: PageBackdropTone;
  /**
   * Si es true incluye la grilla decorativa 88x88 con máscara superior.
   * Por defecto true (uso típico en Catálogo / Consultas / Privacidad).
   */
  withGrid?: boolean;
};

/**
 * Fondo decorativo compartido por las páginas públicas. Inyecta los radiales
 * + grilla que antes vivían inline en cada página, normalizando opacidades y
 * permitiendo elegir el tono secundario (mint o violet) según la página.
 *
 * Pensado para vivir dentro de una <section className="relative overflow-hidden">
 * como primer hijo. Es 100% CSS / aria-hidden — no afecta SSR ni hidratación.
 */
export function PageBackdrop({ className, tone = "cyan-mint", withGrid = true }: PageBackdropProps) {
  const secondaryRadial =
    tone === "cyan-violet"
      ? "bg-[radial-gradient(circle_at_82%_8%,rgba(116,103,201,0.06),transparent_38rem)]"
      : "bg-[radial-gradient(circle_at_84%_8%,rgba(98,184,146,0.05),transparent_38rem)]";

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(22,174,189,0.12),transparent_68%)]",
          className,
        )}
      />
      <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", secondaryRadial)} />
      {withGrid ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(189,206,219,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(189,206,219,0.04)_1px,transparent_1px)] bg-[size:88px_88px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.4),transparent_72%)]"
        />
      ) : null}
    </>
  );
}
