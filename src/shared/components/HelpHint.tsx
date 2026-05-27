import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";

type HelpHintProps = {
  id: string;
  text: string;
};

export function HelpHint({ id, text }: HelpHintProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-controls={id}
        aria-expanded={isOpen}
        aria-label="Mostrar ayuda"
        className="grid h-6 w-6 place-items-center rounded-full border border-surface-200 bg-surface-50 text-ink-500 transition hover:border-accent-cyan/45 hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-cyan/25"
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <CircleHelp size={14} />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "invisible absolute left-1/2 top-8 z-10 w-[min(15rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-surface-200 bg-surface-50 p-3 text-xs font-normal leading-5 text-ink-600 opacity-0 shadow-panel transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 sm:left-0 sm:w-64 sm:translate-x-0",
          isOpen && "visible opacity-100",
        )}
      >
        {text}
      </span>
    </span>
  );
}
