import { FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { fileProcessingLimitLabels, getPdfFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import { countPdfPages, formatFileSize, isPdfFile } from "./pdfPageCounter.service";
import type { PdfPageCounterStatus, PdfPageCountResult } from "./pdfPageCounter.types";

export function PdfPageCounterTool() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<PdfPageCounterStatus>("idle");
  const [result, setResult] = useState<PdfPageCountResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File | undefined) => {
    if (!file) return;
    setResult(null);
    setError(null);

    if (!isPdfFile(file)) {
      setStatus("error");
      setError(t("toolUi.invalidPdfPicked"));
      return;
    }

    const fileLimitError = getPdfFileSizeLimitError(file);
    if (fileLimitError) {
      setStatus("error");
      setError(fileLimitError);
      return;
    }

    setStatus("processing");
    try {
      const nextResult = await countPdfPages(file);
      setResult(nextResult);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : t("toolUi.couldNotReadFile"));
    }
  };

  const clearSelection = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.58fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("toolUi.fileSection")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.pdf-page-counter.ui.intro2")}</p>
          </div>

          <button
            className={cn(
              "grid min-h-64 place-items-center rounded-lg border border-dashed p-6 text-center transition",
              isDragging
                ? "border-accent-cyan bg-accent-cyan/10"
                : "border-surface-200/80 bg-surface-50/80 hover:border-accent-cyan/55 hover:bg-surface-50",
            )}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void processFile(event.dataTransfer.files[0]);
            }}
          >
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={26} />
              </span>
              <span className="mt-4 block text-base font-semibold text-ink-900">{t("toolUi.uploadPdf")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">
                {t("tools.pdf-page-counter.ui.dropHint")}
              </span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{fileProcessingLimitLabels.pdfSingle}</p>

          <input
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            className="hidden"
            type="file"
            onChange={(event) => void processFile(event.target.files?.[0])}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {t("toolUi.uploadPdf")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearSelection} disabled={status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.pdf-page-counter.ui.resultTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.pdf-page-counter.ui.resultIntro")}</p>
        </div>

        <div className="mt-5 grid min-h-64 place-items-center rounded-xl border border-surface-200/80 bg-surface-50/80 p-5 shadow-sm">
          {status === "processing" ? (
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-accent-teal" size={30} />
              <p className="mt-4 text-sm font-semibold text-ink-900">{t("toolUi.readingPdf")}</p>
              <p className="mt-2 text-sm text-ink-500">{t("tools.pdf-page-counter.ui.readingDetail")}</p>
            </div>
          ) : null}

          {status === "success" && result ? (
            <div className="w-full">
              <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-5 text-center">
                <p className="text-sm font-semibold text-ink-700">{t("tools.pdf-page-counter.ui.hasLabel")}</p>
                <p className="mt-2 text-5xl font-semibold text-ink-900">{result.pageCount}</p>
                <p className="mt-2 text-sm font-semibold text-ink-700">
                  {result.pageCount === 1 ? t("toolUi.pagesSingular") : t("toolUi.pagesPlural")}
                </p>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
                  <dt className="text-ink-500">{t("tools.pdf-page-counter.ui.fileLabel")}</dt>
                  <dd className="mt-1 break-all font-semibold text-ink-900">{result.fileName}</dd>
                </div>
                <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
                  <dt className="text-ink-500">{t("tools.pdf-page-counter.ui.fileSize")}</dt>
                  <dd className="mt-1 font-semibold text-ink-900">{formatFileSize(result.fileSize)}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-violet">
                <FileText size={26} />
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-900">{t("tools.pdf-page-counter.ui.couldNotReadTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-ink-500">{error}</p>
            </div>
          ) : null}

          {status === "idle" ? (
            <div className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <FileText size={26} />
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-900">{t("tools.pdf-page-counter.ui.idleTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-ink-500">{t("tools.pdf-page-counter.ui.idleBody")}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
