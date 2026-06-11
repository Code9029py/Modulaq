import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { analyzeTextStats, DEFAULT_WPM, MAX_TEXT_LENGTH } from "./advancedWordCounter.service";

const textareaClassName =
  "min-h-72 w-full resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type StatItem = {
  labelKey: TranslationKey;
  value: number | string;
  approximate?: boolean;
};

function formatReadingTime(seconds: number, t: (key: TranslationKey, vars?: Record<string, string | number>) => string): string {
  if (seconds === 0) return t("tools.advanced-word-counter.ui.readingTimeEmpty");
  if (seconds < 60) return t("tools.advanced-word-counter.ui.readingTimeSeconds", { seconds });
  const minutes = Math.round(seconds / 60);
  return t("tools.advanced-word-counter.ui.readingTimeMinutes", { minutes });
}

function StatCard({ label, value, approximate }: { label: string; value: number | string; approximate?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
      {approximate ? (
        <p className="mt-1 text-xs text-ink-500">{t("tools.advanced-word-counter.ui.approximateNote")}</p>
      ) : null}
    </div>
  );
}

export function AdvancedWordCounterTool() {
  const { t } = useI18n();
  const [text, setText] = useState("");

  const trimmedText = useMemo(() => (text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text), [text]);
  const overLimit = text.length > MAX_TEXT_LENGTH;

  const stats = useMemo(() => analyzeTextStats(trimmedText, { wordsPerMinute: DEFAULT_WPM }), [trimmedText]);

  const clearAll = () => setText("");

  const statsItems: StatItem[] = [
    { labelKey: "tools.advanced-word-counter.ui.statsWords", value: stats.words },
    { labelKey: "tools.advanced-word-counter.ui.statsLines", value: stats.lines },
    { labelKey: "tools.advanced-word-counter.ui.statsCharsWithSpaces", value: stats.characters },
    { labelKey: "tools.advanced-word-counter.ui.statsCharsNoSpaces", value: stats.charactersNoSpaces },
    { labelKey: "tools.advanced-word-counter.ui.statsParagraphs", value: stats.paragraphs },
    { labelKey: "tools.advanced-word-counter.ui.statsSentences", value: stats.sentences, approximate: true },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.advanced-word-counter.ui.inputTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.advanced-word-counter.ui.inputIntro")}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            <span className="flex items-baseline justify-between gap-2">
              <span>{t("tools.advanced-word-counter.ui.contentLabel")}</span>
              <span className={cn("text-xs font-normal", overLimit ? "text-accent-violet" : "text-ink-500")}>
                {t("tools.advanced-word-counter.ui.charCount", { count: text.length, limit: MAX_TEXT_LENGTH })}
              </span>
            </span>
            <textarea
              className={cn(textareaClassName, "min-h-[30rem]")}
              value={text}
              placeholder={t("tools.advanced-word-counter.ui.contentPlaceholder")}
              onChange={(event) => setText(event.target.value)}
            />
          </label>

          {overLimit ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {t("tools.advanced-word-counter.ui.overLimit", { limit: MAX_TEXT_LENGTH })}
            </p>
          ) : null}

          <div>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={text.length === 0}>
              <RotateCcw size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.advanced-word-counter.ui.resultsTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.advanced-word-counter.ui.resultsIntro")}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {statsItems.map((item) => (
            <StatCard
              key={item.labelKey}
              label={t(item.labelKey)}
              value={item.value}
              approximate={item.approximate}
            />
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
            {t("tools.advanced-word-counter.ui.readingTimeLabel")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">
            {formatReadingTime(stats.readingTimeSeconds, t)}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {t("tools.advanced-word-counter.ui.readingTimeHelp", { wpm: stats.wordsPerMinute })}
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-ink-500">{t("tools.advanced-word-counter.ui.localProcessingNote")}</p>
      </section>
    </div>
  );
}
