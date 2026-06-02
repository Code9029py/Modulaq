/**
 * Clase Tailwind compartida para inputs/textareas/selects de las páginas públicas
 * (catálogo, contacto, etc.). Mantiene altura, borde, fondo, sombra y focus ring
 * coherentes con el sistema visual Post-V3 / Fase A.
 *
 * Para inputs internos de herramientas se mantiene su receta local (Fase B).
 */
export const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";
