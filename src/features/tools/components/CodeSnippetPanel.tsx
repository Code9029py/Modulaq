import { Check, Copy, Package, ListChecks, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { CodeSnippet, ToolIntegrableCode } from "../types/tool.types";

type CodeSnippetPanelProps = {
  data: ToolIntegrableCode;
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Código copiado" : "Copiar código"}
      className="inline-flex items-center gap-1.5 rounded-md border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-surface-100 hover:text-ink-900"
    >
      {copied ? <Check size={14} className="text-accent-teal" /> : <Copy size={14} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function SnippetCard({ snippet }: { snippet: CodeSnippet }) {
  return (
    <article className="min-w-0 max-w-full overflow-hidden rounded-lg border border-surface-200 bg-surface-50/70">
      <header className="flex flex-col gap-2 border-b border-surface-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">{snippet.title}</h3>
          {snippet.description ? (
            <p className="mt-1 text-sm leading-6 text-ink-500">{snippet.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-md border border-surface-200 bg-surface-100/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            {snippet.language}
          </span>
          <CopyButton code={snippet.code} />
        </div>
      </header>

      <pre className="max-w-full overflow-x-auto px-4 py-3 text-[13px] leading-6">
        <code className="font-mono text-ink-900 whitespace-pre">{snippet.code}</code>
      </pre>

      {snippet.dependencies && snippet.dependencies.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-surface-200 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700">
            <Package size={14} className="text-accent-teal" />
            Dependencias
          </span>
          {snippet.dependencies.map((dependency) => (
            <code
              key={dependency}
              className="rounded-md border border-surface-200 bg-surface-100/80 px-2 py-1 font-mono text-xs text-ink-900"
            >
              {dependency}
            </code>
          ))}
        </div>
      ) : null}

      {snippet.usageNotes && snippet.usageNotes.length > 0 ? (
        <div className="border-t border-surface-200 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
            <ListChecks size={14} className="text-accent-teal" />
            Notas de uso
          </p>
          <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm leading-6 text-ink-700 marker:text-ink-300">
            {snippet.usageNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {snippet.limitations && snippet.limitations.length > 0 ? (
        <div className="border-t border-surface-200 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
            <TriangleAlert size={14} className="text-accent-teal" />
            Limitaciones
          </p>
          <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm leading-6 text-ink-700 marker:text-ink-300">
            {snippet.limitations.map((limitation, index) => (
              <li key={index}>{limitation}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function CodeSnippetPanel({ data }: CodeSnippetPanelProps) {
  return (
    <div className="grid min-w-0 max-w-full gap-4">
      {data.summary ? <p className="text-sm leading-6 text-ink-700">{data.summary}</p> : null}
      {data.snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}
    </div>
  );
}
