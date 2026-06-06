import { cn } from "../../../shared/utils/cn";

type OutputFormatSelectorProps<Format extends string> = {
  description: string;
  formats: readonly Format[];
  getLabel: (format: Format) => string;
  label: string;
  onChange: (format: Format) => void;
  value: Format;
};

export function OutputFormatSelector<Format extends string>({
  description,
  formats,
  getLabel,
  label,
  onChange,
  value,
}: OutputFormatSelectorProps<Format>) {
  return (
    <div className="grid min-w-0 gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <div className="flex min-w-0 flex-wrap gap-2">
        {formats.map((format) => (
          <button
            key={format}
            type="button"
            className={cn(
              "min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition",
              value === format
                ? "border-accent-cyan/45 bg-accent-cyan/10 text-ink-900"
                : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/35",
            )}
            onClick={() => onChange(format)}
          >
            {getLabel(format)}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-ink-500">{description}</p>
    </div>
  );
}
