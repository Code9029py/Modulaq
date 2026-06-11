import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import {
  compareTexts,
  MAX_TEXT_LENGTH,
  type CompareMode,
  type DiffEntry,
} from "./compareTexts.service";

const textareaClassName =
  "min-h-56 w-full resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

function renderEntryValue(entry: DiffEntry, mode: CompareMode): string {
  if (entry.value.length === 0 && mode === "lines") return " ";
  return entry.value;
}

export function CompareTextsTool() {
  const { t } = useI18n();
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [mode, setMode] = useState<CompareMode>("lines");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const leftOver = leftText.length > MAX_TEXT_LENGTH;
  const rightOver = rightText.length > MAX_TEXT_LENGTH;
  const overLimit = leftOver || rightOver;

  const safeLeft = leftOver ? leftText.slice(0, MAX_TEXT_LENGTH) : leftText;
  const safeRight = rightOver ? rightText.slice(0, MAX_TEXT_LENGTH) : rightText;

  const result = useMemo(
    () =>
      compareTexts(safeLeft, safeRight, {
        mode,
        ignoreCase,
        ignoreWhitespace,
      }),
    [safeLeft, safeRight, mode, ignoreCase, ignoreWhitespace],
  );

  const isEmpty = safeLeft.length === 0 && safeRight.length === 0;

  const clearAll = () => {
    setLeftText("");
    setRightText("");
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            <span className="flex items-baseline justify-between gap-2">
              <span>{t("tools.compare-texts.ui.leftLabel")}</span>
              <span className={cn("text-xs font-normal", leftOver ? "text-accent-violet" : "text-ink-500")}>
                {t("tools.compare-texts.ui.charCount", { count: leftText.length, limit: MAX_TEXT_LENGTH })}
              </span>
            </span>
            <textarea
              className={cn(textareaClassName, "min-h-[18rem]")}
              value={leftText}
              placeholder={t("tools.compare-texts.ui.leftPlaceholder")}
              onChange={(event) => setLeftText(event.target.value)}
              spellCheck={false}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            <span className="flex items-baseline justify-between gap-2">
              <span>{t("tools.compare-texts.ui.rightLabel")}</span>
              <span className={cn("text-xs font-normal", rightOver ? "text-accent-violet" : "text-ink-500")}>
                {t("tools.compare-texts.ui.charCount", { count: rightText.length, limit: MAX_TEXT_LENGTH })}
              </span>
            </span>
            <textarea
              className={cn(textareaClassName, "min-h-[18rem]")}
              value={rightText}
              placeholder={t("tools.compare-texts.ui.rightPlaceholder")}
              onChange={(event) => setRightText(event.target.value)}
              spellCheck={false}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-10 sm:gap-y-4">
          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t("tools.compare-texts.ui.modeLabel")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {(["lines", "words"] as const).map((value) => {
                const isActive = mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMode(value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
                      isActive
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                        : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
                    )}
                  >
                    {t(`tools.compare-texts.ui.mode.${value}` as const)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t("tools.compare-texts.ui.optionsLabel")}
            </legend>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-1.5 text-sm font-semibold text-ink-700 shadow-sm hover:border-accent-cyan/30">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={() => setIgnoreCase((value) => !value)}
                  className="h-4 w-4 accent-accent-cyan"
                />
                {t("tools.compare-texts.ui.ignoreCase")}
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-1.5 text-sm font-semibold text-ink-700 shadow-sm hover:border-accent-cyan/30">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={() => setIgnoreWhitespace((value) => !value)}
                  className="h-4 w-4 accent-accent-cyan"
                />
                {t("tools.compare-texts.ui.ignoreWhitespace")}
              </label>
            </div>
          </fieldset>
        </div>

        {overLimit ? (
          <p className="mt-3 rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
            {t("tools.compare-texts.ui.overLimit", { limit: MAX_TEXT_LENGTH })}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={isEmpty}>
            <RotateCcw size={16} />
            {t("toolUi.clearAll")}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.compare-texts.ui.resultsTitle")}</h3>
            <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.compare-texts.ui.resultsIntro")}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-accent-teal/25 bg-accent-teal/10 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
              {t("tools.compare-texts.ui.summaryAdded")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{result.summary.added}</p>
          </div>
          <div className="rounded-xl border border-accent-violet/25 bg-accent-violet/10 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
              {t("tools.compare-texts.ui.summaryRemoved")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{result.summary.removed}</p>
          </div>
          <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t("tools.compare-texts.ui.summaryUnchanged")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{result.summary.unchanged}</p>
          </div>
          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
              {t("tools.compare-texts.ui.summaryTotal")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{result.summary.totalDifferences}</p>
          </div>
        </div>

        <div className="mt-4 max-h-[28rem] overflow-auto rounded-xl border border-surface-200/80 bg-surface-50 p-3 text-sm">
          {isEmpty ? (
            <p className="px-2 py-6 text-center text-sm text-ink-500">{t("tools.compare-texts.ui.emptyState")}</p>
          ) : result.entries.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-ink-500">{t("tools.compare-texts.ui.noDifferences")}</p>
          ) : mode === "lines" ? (
            <ul className="grid gap-1 font-mono text-xs leading-5">
              {result.entries.map((entry, index) => (
                <li
                  key={index}
                  className={cn(
                    "rounded px-2 py-1",
                    entry.type === "added" && "bg-accent-teal/15 text-ink-900",
                    entry.type === "removed" && "bg-accent-violet/15 text-ink-900 line-through decoration-accent-violet/60",
                    entry.type === "unchanged" && "text-ink-700",
                  )}
                >
                  <span className="mr-2 inline-block w-4 text-right text-ink-500">
                    {entry.type === "added" ? "+" : entry.type === "removed" ? "−" : " "}
                  </span>
                  <span className="whitespace-pre-wrap">{renderEntryValue(entry, mode)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex flex-wrap gap-1 font-mono text-xs leading-5">
              {result.entries.map((entry, index) => (
                <span
                  key={index}
                  className={cn(
                    "rounded px-1.5 py-0.5",
                    entry.type === "added" && "bg-accent-teal/20 text-ink-900",
                    entry.type === "removed" && "bg-accent-violet/15 text-ink-900 line-through decoration-accent-violet/60",
                    entry.type === "unchanged" && "text-ink-700",
                  )}
                >
                  {entry.value}
                </span>
              ))}
            </p>
          )}
        </div>

        <p className="mt-3 text-xs leading-5 text-ink-500">{t("tools.compare-texts.ui.localProcessingNote")}</p>
      </section>
    </div>
  );
}
