import { Download, FileText, Loader2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import {
  buildOutputFileName,
  defaultOutputBaseName,
  generateTextPdf,
  MAX_TEXT_LENGTH,
} from "./textToPdf.service";
import type { TextToPdfFormOptions, TextToPdfPageSize, TextToPdfStatus } from "./textToPdf.types";

const inputClassName =
  "min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

const defaultFormOptions: TextToPdfFormOptions = {
  title: "",
  fontSize: 12,
  margin: 56,
  pageSize: "a4",
};

const fontSizes = [10, 12, 14, 16] as const;
const margins = [
  { value: 36, labelKey: "tools.text-to-pdf.ui.marginSmall" },
  { value: 56, labelKey: "tools.text-to-pdf.ui.marginMedium" },
  { value: 80, labelKey: "tools.text-to-pdf.ui.marginLarge" },
] as const;
const pageSizes: readonly TextToPdfPageSize[] = ["a4", "letter"];

export function TextToPdfTool() {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [options, setOptions] = useState<TextToPdfFormOptions>(defaultFormOptions);
  const [outputBaseName, setOutputBaseName] = useState(defaultOutputBaseName);
  const [status, setStatus] = useState<TextToPdfStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastResultPages, setLastResultPages] = useState<number | null>(null);

  const trimmedTextLength = text.trim().length;
  const overLimit = text.length > MAX_TEXT_LENGTH;
  const canGenerate = trimmedTextLength > 0 && !overLimit && status !== "processing";

  const sanitizedOutputFileName = useMemo(() => buildOutputFileName(outputBaseName), [outputBaseName]);

  const resetFeedback = () => {
    setError(null);
    setLastResultPages(null);
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  };

  const downloadPdf = (bytes: ArrayBuffer, fileName: string) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generate = async () => {
    if (!canGenerate) return;
    setStatus("processing");
    setError(null);
    setLastResultPages(null);

    try {
      const result = await generateTextPdf(text, options, outputBaseName);
      downloadPdf(result.bytes, result.fileName);
      setLastResultPages(result.pageCount);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.textToPdfFailed"));
    }
  };

  const clearAll = () => {
    setText("");
    setOptions(defaultFormOptions);
    setOutputBaseName(defaultOutputBaseName);
    setStatus("idle");
    setError(null);
    setLastResultPages(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.text-to-pdf.ui.textSection")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.text-to-pdf.ui.textIntro")}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("tools.text-to-pdf.ui.titleLabel")}
            <input
              className={inputClassName}
              value={options.title}
              maxLength={120}
              placeholder={t("tools.text-to-pdf.ui.titlePlaceholder")}
              onChange={(event) => {
                setOptions((prev) => ({ ...prev, title: event.target.value }));
                resetFeedback();
              }}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            <span className="flex items-baseline justify-between gap-2">
              <span>{t("tools.text-to-pdf.ui.contentLabel")}</span>
              <span className={cn("text-xs font-normal", overLimit ? "text-accent-violet" : "text-ink-500")}>
                {t("tools.text-to-pdf.ui.charCount", { count: text.length, limit: MAX_TEXT_LENGTH })}
              </span>
            </span>
            <textarea
              className={cn(inputClassName, "min-h-72 resize-y py-2 leading-6")}
              value={text}
              placeholder={t("tools.text-to-pdf.ui.contentPlaceholder")}
              onChange={(event) => {
                setText(event.target.value);
                resetFeedback();
              }}
            />
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-ink-700">{t("tools.text-to-pdf.ui.layoutSection")}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                {t("tools.text-to-pdf.ui.fontSizeLabel")}
                <select
                  className={inputClassName}
                  value={options.fontSize}
                  onChange={(event) => {
                    setOptions((prev) => ({ ...prev, fontSize: Number(event.target.value) }));
                    resetFeedback();
                  }}
                >
                  {fontSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}pt
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                {t("tools.text-to-pdf.ui.marginLabel")}
                <select
                  className={inputClassName}
                  value={options.margin}
                  onChange={(event) => {
                    setOptions((prev) => ({ ...prev, margin: Number(event.target.value) }));
                    resetFeedback();
                  }}
                >
                  {margins.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {t(entry.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                {t("tools.text-to-pdf.ui.pageSizeLabel")}
                <select
                  className={inputClassName}
                  value={options.pageSize}
                  onChange={(event) => {
                    setOptions((prev) => ({ ...prev, pageSize: event.target.value as TextToPdfPageSize }));
                    resetFeedback();
                  }}
                >
                  {pageSizes.map((size) => (
                    <option key={size} value={size}>
                      {t(`tools.text-to-pdf.ui.pageSize.${size}` as const)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.text-to-pdf.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.text-to-pdf.ui.outputIntro")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">{t("tools.text-to-pdf.ui.previewLabel")}</p>
            <p className="mt-2 text-3xl font-semibold text-ink-900">
              {trimmedTextLength > 0
                ? t("tools.text-to-pdf.ui.charSummary", { count: trimmedTextLength })
                : t("tools.text-to-pdf.ui.previewEmpty")}
            </p>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
            {t("toolUi.outputNameDownload")}
            <input
              className={inputClassName}
              value={outputBaseName}
              placeholder={defaultOutputBaseName}
              onChange={(event) => {
                setOutputBaseName(event.target.value);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal text-ink-500">
              {t("toolUi.downloadAs", { name: sanitizedOutputFileName })}
            </span>
          </label>

          {overLimit ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {t("tools.errors.textToPdfTooLong", { limit: MAX_TEXT_LENGTH })}
            </p>
          ) : null}

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("tools.text-to-pdf.ui.generating")}
            </p>
          ) : null}

          {status === "success" && lastResultPages !== null ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">
              {t("toolUi.outputReadyWithPages", { pages: lastResultPages })}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {error}
            </p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void generate()} disabled={!canGenerate}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {t("tools.text-to-pdf.ui.generateCta")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={trimmedTextLength === 0 && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>

          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-ink-500">
            <FileText className="mt-0.5 shrink-0 text-accent-teal" size={14} />
            {t("tools.text-to-pdf.ui.localProcessingNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
