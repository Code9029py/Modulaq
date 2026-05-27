import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";

export type ContactType = "tool-request" | "general" | "bug-report" | "collaboration";

type ContactFormProps = {
  initialType: ContactType;
};

const contactTypeOptions: Array<{ label: string; value: ContactType; isVisible: boolean }> = [
  { label: "Solicitar herramienta", value: "tool-request", isVisible: true },
  { label: "Consulta general", value: "general", isVisible: true },
  { label: "Reportar problema", value: "bug-report", isVisible: true },
  { label: "Propuesta o colaboración", value: "collaboration", isVisible: false },
];
const visibleContactTypeOptions = contactTypeOptions.filter((option) => option.isVisible);

const copyByType: Record<
  ContactType,
  {
    description: string;
    detailLabel: string;
    detailPlaceholder: string;
    formTitle: string;
    messageLabel: string;
    messagePlaceholder: string;
    note: string;
  }
> = {
  "tool-request": {
    formTitle: "Solicitar herramienta",
    description: "Contanos qué microherramienta te gustaría sumar al ecosistema.",
    detailLabel: "Herramienta solicitada",
    detailPlaceholder: "Ejemplo: convertir CSV a JSON",
    messageLabel: "Descripción breve",
    messagePlaceholder: "Qué debería resolver y cómo la usarías...",
    note: "La solicitud queda como formulario visual en V1, sin envío ni almacenamiento.",
  },
  general: {
    formTitle: "Consulta general",
    description: "Usá este canal para preguntas, ideas o comentarios sobre Modulaq.",
    detailLabel: "Tema",
    detailPlaceholder: "Ejemplo: duda sobre Modulaq",
    messageLabel: "Mensaje",
    messagePlaceholder: "Contame qué necesitás revisar o consultar...",
    note: "Contacto preparado para una integración futura, todavía sin backend.",
  },
  "bug-report": {
    formTitle: "Reportar problema",
    description: "Ayudanos a detectar fricciones, errores visuales o comportamientos inesperados.",
    detailLabel: "Dónde ocurre",
    detailPlaceholder: "Ejemplo: catálogo, limpiador de texto, navegación móvil",
    messageLabel: "Qué pasó",
    messagePlaceholder: "Describí el problema y los pasos para reproducirlo...",
    note: "El reporte no se envía todavía; queda como estructura de UX para una versión futura.",
  },
  collaboration: {
    formTitle: "Propuesta o colaboración",
    description: "Espacio para ideas de integración, contenido o colaboración alrededor de Modulaq.",
    detailLabel: "Tipo de propuesta",
    detailPlaceholder: "Ejemplo: integración, herramienta, contenido, alianza",
    messageLabel: "Propuesta",
    messagePlaceholder: "Resumen de la idea y cómo podría aportar al ecosistema...",
    note: "La V1 no transmite información. Este bloque define la experiencia futura.",
  },
};

const inputClassName =
  "min-h-11 rounded-md border border-surface-200 bg-surface-50/80 px-3 font-normal text-ink-900 outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/15";

export function ContactForm({ initialType }: ContactFormProps) {
  const [contactType, setContactType] = useState<ContactType>(initialType === "collaboration" ? "general" : initialType);
  const [isDesktopTypeListOpen, setIsDesktopTypeListOpen] = useState(true);
  const copy = useMemo(() => copyByType[contactType], [contactType]);

  return (
    <div
      className={cn(
        "grid gap-5",
        isDesktopTypeListOpen ? "lg:grid-cols-[230px_1fr]" : "lg:grid-cols-1",
      )}
    >
      {isDesktopTypeListOpen ? (
        <aside className="hidden rounded-lg border border-surface-200 bg-surface-50/82 shadow-panel lg:block">
          <button
            className="flex min-h-12 w-full items-center justify-center border-b border-surface-200 px-3 text-sm font-semibold text-ink-700 transition hover:bg-surface-100"
            type="button"
            onClick={() => setIsDesktopTypeListOpen(false)}
          >
            Reducir tipos
            <ArrowLeft className="ml-2" size={16} />
          </button>
          <div className="grid gap-2 p-3">
            {visibleContactTypeOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm font-semibold transition",
                  contactType === option.value
                    ? "bg-ink-900 text-surface-50 shadow-sm"
                    : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                )}
                type="button"
                onClick={() => setContactType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </aside>
      ) : (
        <div className="hidden lg:block">
          <Button type="button" variant="secondary" onClick={() => setIsDesktopTypeListOpen(true)}>
            Expandir tipos
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      )}

      <div className="grid gap-5">
        <div className="rounded-lg border border-surface-200 bg-surface-50/82 p-3 shadow-sm lg:hidden">
          <p className="mb-3 text-sm font-semibold text-ink-900">Tipo de consulta</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleContactTypeOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                  contactType === option.value
                    ? "border-ink-900 bg-ink-900 text-surface-50"
                    : "border-surface-200 bg-surface-100/70 text-ink-700",
                )}
                type="button"
                onClick={() => setContactType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <form className="grid gap-5 rounded-lg border border-surface-200 bg-surface-50/82 p-5 shadow-panel lg:grid-cols-2">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-ink-900">{copy.formTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{copy.description}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Nombre
            <input className={inputClassName} placeholder="Tu nombre" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Correo
            <input className={inputClassName} placeholder="tu@email.com" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700 lg:col-span-2">
            {copy.detailLabel}
            <input className={inputClassName} placeholder={copy.detailPlaceholder} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700 lg:col-span-2">
            {copy.messageLabel}
            <textarea className={`${inputClassName} min-h-36 py-3`} placeholder={copy.messagePlaceholder} />
          </label>
          <div className="lg:col-span-2">
            <Button type="button">
              <Send className="mr-2" size={17} />
              Guardar próximamente
            </Button>
            <p className="mt-3 text-sm text-ink-500">{copy.note}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
