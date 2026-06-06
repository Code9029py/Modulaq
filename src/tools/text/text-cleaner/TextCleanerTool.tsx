import { ArrowDown, ArrowDownUp, ArrowUp, Clipboard, Download, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import { cleanText, defaultTextCleanerOptions } from "./textCleaner.service";
import type { TextCleanerOptions, TextStats } from "./textCleaner.types";

type OptionDescriptor = {
  id: keyof TextCleanerOptions;
  labelKey: TranslationKey;
  descKey: TranslationKey;
};

const optionItems: OptionDescriptor[] = [
  { id: "removeMultipleSpaces", labelKey: "tools.text-cleaner.ui.optLabel.removeMultipleSpaces", descKey: "tools.text-cleaner.ui.optDesc.removeMultipleSpaces" },
  { id: "removeExtraLineBreaks", labelKey: "tools.text-cleaner.ui.optLabel.removeExtraLineBreaks", descKey: "tools.text-cleaner.ui.optDesc.removeExtraLineBreaks" },
  { id: "trimEdges", labelKey: "tools.text-cleaner.ui.optLabel.trimEdges", descKey: "tools.text-cleaner.ui.optDesc.trimEdges" },
  { id: "normalizeQuotes", labelKey: "tools.text-cleaner.ui.optLabel.normalizeQuotes", descKey: "tools.text-cleaner.ui.optDesc.normalizeQuotes" },
  { id: "removeInvisibleCharacters", labelKey: "tools.text-cleaner.ui.optLabel.removeInvisibleCharacters", descKey: "tools.text-cleaner.ui.optDesc.removeInvisibleCharacters" },
  { id: "collapseEmptyLines", labelKey: "tools.text-cleaner.ui.optLabel.collapseEmptyLines", descKey: "tools.text-cleaner.ui.optDesc.collapseEmptyLines" },
];

const textareaClassName =
  "min-h-72 w-full flex-1 resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

function OptionsList({
  options,
  updateOption,
}: {
  options: TextCleanerOptions;
  updateOption: (optionId: keyof TextCleanerOptions) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2">
      {optionItems.map((option) => (
        <label
          key={option.id}
          className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm transition hover:border-accent-cyan/50 hover:bg-surface-50"
        >
          <input
            className="mt-1 h-4 w-4 accent-accent-cyan"
            type="checkbox"
            checked={options[option.id]}
            onChange={() => updateOption(option.id)}
          />
          <span>
            <span className="block text-sm font-semibold text-ink-900">{t(option.labelKey)}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-500">{t(option.descKey)}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function StatCard({ label, before, after }: { label: string; before: number; after: number }) {
  const { t } = useI18n();
  const delta = after - before;

  return (
    <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className={cn("text-xs font-semibold", delta === 0 ? "text-ink-500" : "text-ink-700")}>
          {delta === 0 ? t("tools.text-cleaner.ui.noChanges") : `${delta > 0 ? "+" : ""}${delta}`}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-ink-500">{t("tools.text-cleaner.ui.statsBefore")}</p>
          <p className="text-2xl font-semibold text-ink-900">{before}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">{t("tools.text-cleaner.ui.statsAfter")}</p>
          <p className="text-2xl font-semibold text-ink-900">{after}</p>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ before, after }: { before: TextStats; after: TextStats }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <StatCard label={t("tools.text-cleaner.ui.statsCharsLabel")} before={before.characters} after={after.characters} />
      <StatCard label={t("tools.text-cleaner.ui.statsWordsLabel")} before={before.words} after={after.words} />
      <StatCard label={t("tools.text-cleaner.ui.statsLinesLabel")} before={before.lines} after={after.lines} />
    </div>
  );
}

export function TextCleanerTool() {
  const { t } = useI18n();
  const defaultOutputBaseName = t("tools.text-cleaner.ui.defaultOutputName");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<TextCleanerOptions>(defaultTextCleanerOptions);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);

  const result = useMemo(() => cleanText(input, options), [input, options]);
  const hasOutput = result.output.length > 0;
  const activeOptionsCount = Object.values(options).filter(Boolean).length;
  const finalOutputFileName = buildDownloadFileName(outputFileName, "txt", defaultOutputBaseName);

  const updateOption = (optionId: keyof TextCleanerOptions) => {
    setOptions((currentOptions) => ({ ...currentOptions, [optionId]: !currentOptions[optionId] }));
  };

  const copyResult = async () => {
    if (!hasOutput) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const clearAll = () => {
    setInput("");
    setCopyStatus("idle");
    setOutputFileName(defaultOutputBaseName);
  };

  const useOutputAsInput = () => {
    setInput(result.output);
    setCopyStatus("idle");
  };

  const downloadResult = () => {
    if (!hasOutput) return;
    const url = URL.createObjectURL(new Blob([result.output], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = finalOutputFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-5">
      <div className="hidden justify-end lg:flex">
        <Button type="button" variant="secondary" className="gap-2" onClick={() => setIsOptionsOpen((value) => !value)}>
          <SlidersHorizontal size={16} />
          {isOptionsOpen ? t("tools.text-cleaner.ui.hideOptions") : t("tools.text-cleaner.ui.showOptions")}
          {isOptionsOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </Button>
      </div>

      <div className={cn("grid gap-5", isOptionsOpen ? "lg:grid-cols-[1fr_300px]" : "lg:grid-cols-1")}>
        <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
          <div className="grid gap-4 xl:grid-cols-2">
            <article className="grid gap-3">
              <div className="xl:min-h-[5.75rem]">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{t("tools.text-cleaner.ui.originalTitle")}</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.text-cleaner.ui.originalIntro")}</p>
                </div>
                <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2 whitespace-nowrap px-3"
                    onClick={clearAll}
                    disabled={!input && outputFileName === defaultOutputBaseName}
                  >
                    <Trash2 size={16} />
                    {t("toolUi.clear")}
                  </Button>
                </div>
              </div>
              <textarea
                className={cn(textareaClassName, "min-h-[30rem]")}
                placeholder={t("tools.text-cleaner.ui.usePlaceholder")}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setCopyStatus("idle");
                }}
              />
            </article>

            <article className="grid gap-3">
              <div className="xl:min-h-[5.75rem]">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{t("tools.text-cleaner.ui.outputTitle2")}</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.text-cleaner.ui.outputIntro2")}</p>
                </div>
                <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" className="shrink-0 gap-2 whitespace-nowrap px-3" onClick={copyResult} disabled={!hasOutput}>
                    <Clipboard size={16} />
                    {copyStatus === "copied" ? t("toolUi.copied") : t("toolUi.copy")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 gap-2 whitespace-nowrap px-3"
                    onClick={useOutputAsInput}
                    disabled={!hasOutput}
                  >
                    <ArrowDownUp size={16} />
                    {t("tools.text-cleaner.ui.useAsInput")}
                  </Button>
                </div>
              </div>
              <textarea className={cn(textareaClassName, "min-h-[30rem]")} readOnly placeholder={t("tools.text-cleaner.ui.outputPlaceholder")} value={result.output} />
            </article>
          </div>

          <div className="mt-4">
            <label className="grid gap-2 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm font-semibold text-ink-700 shadow-sm">
              <span>{t("toolUi.outputName")}</span>
              <span className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
                  value={outputFileName}
                  placeholder={defaultOutputBaseName}
                  onChange={(event) => setOutputFileName(event.target.value)}
                />
                <Button type="button" variant="secondary" className="w-full gap-2 px-3 sm:w-auto" onClick={downloadResult} disabled={!hasOutput}>
                  <Download size={16} />
                  {t("toolUi.downloadTxt")}
                </Button>
              </span>
              <span className="break-all text-xs font-normal leading-5 text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
            </label>
          </div>

          {copyStatus === "error" ? (
            <p className="mt-4 text-sm font-semibold text-ink-700">
              {t("tools.text-cleaner.ui.copyFailed")}
            </p>
          ) : null}
        </section>

        {isOptionsOpen ? (
          <aside className="hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur lg:block">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink-900">{t("tools.text-cleaner.ui.optionsTitle2")}</h3>
              <p className="mt-1 text-xs text-ink-500">{t("tools.text-cleaner.ui.activeCount", { active: activeOptionsCount })}</p>
            </div>
            <OptionsList options={options} updateOption={updateOption} />
          </aside>
        ) : null}
      </div>

      <section className="rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-sm ring-1 ring-surface-50/80 backdrop-blur lg:hidden">
        <button
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-ink-900"
          type="button"
          onClick={() => setIsMobileOptionsOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-2">
            {isMobileOptionsOpen ? t("tools.text-cleaner.ui.hideOptions") : t("tools.text-cleaner.ui.showOptions")}
            {isMobileOptionsOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </span>
          <span className="text-xs font-semibold text-ink-500">{t("tools.text-cleaner.ui.activeCount", { active: activeOptionsCount })}</span>
        </button>
        {isMobileOptionsOpen ? (
          <div className="border-t border-surface-200/80 p-3">
            <OptionsList options={options} updateOption={updateOption} />
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
        <button
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-ink-900 transition hover:bg-surface-100/70"
          type="button"
          aria-expanded={isStatsOpen}
          onClick={() => setIsStatsOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-2">
            <RotateCcw size={16} />
            {t("tools.text-cleaner.ui.statsLabel")}
          </span>
          {isStatsOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </button>
        {isStatsOpen ? (
          <div className="border-t border-surface-200/80 p-4">
            <StatsGrid before={result.before} after={result.after} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
