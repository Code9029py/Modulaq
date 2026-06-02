import { AlertTriangle, Lightbulb, ListChecks, ShieldCheck, SlidersHorizontal, TriangleAlert } from "lucide-react";
import type { ToolDoc } from "../types/tool.types";

type ToolDocPanelProps = {
  doc: ToolDoc;
};

type DocSectionProps = {
  icon: typeof ListChecks;
  title: string;
  children: React.ReactNode;
};

function DocSection({ icon: Icon, title, children }: DocSectionProps) {
  return (
    <section className="rounded-xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/45 p-4 shadow-sm ring-1 ring-surface-50/80">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Icon size={16} className="text-accent-teal" />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-6 text-ink-700">{children}</div>
    </section>
  );
}

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="grid list-decimal gap-1.5 pl-5 marker:text-ink-500">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

function UnorderedList({ items }: { items: string[] }) {
  return (
    <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function ToolDocPanel({ doc }: ToolDocPanelProps) {
  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-ink-700">{doc.summary}</p>

      <DocSection icon={ListChecks} title="Cómo usarla">
        <OrderedList items={doc.howTo} />
      </DocSection>

      <DocSection icon={Lightbulb} title="Casos de uso">
        <UnorderedList items={doc.useCases} />
      </DocSection>

      {doc.limits && doc.limits.length > 0 ? (
        <DocSection icon={SlidersHorizontal} title="Límites">
          <UnorderedList items={doc.limits} />
        </DocSection>
      ) : null}

      {doc.privacy ? (
        <DocSection icon={ShieldCheck} title="Privacidad">
          <p>{doc.privacy}</p>
        </DocSection>
      ) : null}

      {doc.commonErrors && doc.commonErrors.length > 0 ? (
        <DocSection icon={TriangleAlert} title="Errores comunes">
          <UnorderedList items={doc.commonErrors} />
        </DocSection>
      ) : null}

      {doc.technicalNotes && doc.technicalNotes.length > 0 ? (
        <DocSection icon={AlertTriangle} title="Notas técnicas">
          <UnorderedList items={doc.technicalNotes} />
        </DocSection>
      ) : null}
    </div>
  );
}
