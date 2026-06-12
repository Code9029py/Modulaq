import { Download, FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import {
  formatFileSize,
  getDefaultOutputBaseName,
  getOutputFileName,
  getSuggestedOutputBaseName,
  isPdfFile,
  readPdfMetadata,
  removePdfPagesFromFile,
  validateRangeInput,
} from "./removePdfPages.service";
import type { RemovePdfPagesMetadata, RemovePdfPagesStatus } from "./removePdfPages.types";

const inputClassName =
  "min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

export function RemovePdfPagesTool() {
  const { language, t } = useI18n();
  const limitLabels = useFileProcessingLimitLabels();
  const localizedDefaultOutputBaseName = getDefaultOutputBaseName(language);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<RemovePdfPagesMetadata | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [status, setStatus] = useState<RemovePdfPagesStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputBaseName, setOutputBaseName] = useState(localizedDefaultOutputBaseName);
  const [hasCustomOutputName, setHasCustomOutputName] = useState(false);
  const [lastResult, setLastResult] = useState<{ removed: number; remaining: number } | null>(null);

  const isBusy = status === "reading" || status === "processing";
  const fallbackBaseName = metadata
    ? getSuggestedOutputBaseName(metadata.fileName, localizedDefaultOutputBaseName)
    : localizedDefaultOutputBaseName;
  const finalOutputFileName = useMemo(
    () => getOutputFileName(outputBaseName, fallbackBaseName),
    [outputBaseName, fallbackBaseName],
  );

  // Validación dinámica del rango contra el total real del PDF. La UI muestra
  // ayuda normal mientras el campo está vacío y no le grita al usuario.
  const liveValidation = useMemo(() => {
    if (!metadata) return null;
    return validateRangeInput(rangeInput, metadata.pageCount);
  }, [metadata, rangeInput]);

  const liveError =
    liveValidation && liveValidation.state === "error"
      ? t(liveValidation.code as TranslationKey, liveValidation.vars)
      : null;

  const canRemove =
    Boolean(metadata) && !isBusy && liveValidation?.state === "ok";

  const resetFeedback = () => {
    setError(null);
    setLastResult(null);
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return;
    setLastResult(null);
    setError(null);

    if (!isPdfFile(selected)) {
      setStatus("error");
      setError(t("toolUi.invalidPdfPicked"));
      return;
    }
    const limitError = limitLabels.getPdfFileSizeLimitError(selected);
    if (limitError) {
      setStatus("error");
      setError(limitError);
      return;
    }

    setStatus("reading");
    try {
      const meta = await readPdfMetadata(selected);
      setFile(selected);
      setMetadata(meta);
      setRangeInput("");
      if (!hasCustomOutputName) {
        setOutputBaseName(getSuggestedOutputBaseName(meta.fileName, localizedDefaultOutputBaseName));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "toolUi.couldNotReadFile"));
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

  const handleRemove = async () => {
    if (!file || !canRemove) return;
    setStatus("processing");
    setError(null);
    setLastResult(null);

    try {
      const result = await removePdfPagesFromFile(file, rangeInput, outputBaseName, localizedDefaultOutputBaseName);
      downloadPdf(result.bytes, result.fileName);
      setLastResult({ removed: result.removedCount, remaining: result.remainingCount });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.removePdfPagesFailed"));
    }
  };

  const clearAll = () => {
    setFile(null);
    setMetadata(null);
    setRangeInput("");
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    setOutputBaseName(localizedDefaultOutputBaseName);
    setHasCustomOutputName(false);
    setLastResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.remove-pdf-pages.ui.fileSection")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.remove-pdf-pages.ui.intro")}</p>
          </div>

          <button
            className={cn(
              "grid min-h-52 place-items-center rounded-lg border border-dashed p-6 text-center transition",
              isDragging ? "border-accent-cyan bg-accent-cyan/10" : "border-surface-200/80 bg-surface-50/80 hover:border-accent-cyan/55 hover:bg-surface-50",
            )}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={26} />
              </span>
              <span className="mt-4 block text-base font-semibold text-ink-900">{t("toolUi.uploadPdf")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("toolUi.dropHere")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{limitLabels.pdfSingle}</p>

          <input
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            className="hidden"
            type="file"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {metadata ? (
            <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <p className="truncate text-sm font-semibold text-ink-900">{metadata.fileName}</p>
              <p className="mt-1 text-xs text-ink-500">
                {formatFileSize(metadata.fileSize)} · {metadata.pageCount} {metadata.pageCount === 1 ? t("toolUi.pagesSingular") : t("toolUi.pagesPlural")}
              </p>
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("tools.remove-pdf-pages.ui.rangeLabel")}
            <input
              className={cn(
                inputClassName,
                liveError ? "border-accent-violet/40 focus:border-accent-violet" : "",
              )}
              value={rangeInput}
              placeholder={t("tools.remove-pdf-pages.ui.rangePlaceholder")}
              disabled={!metadata}
              onChange={(event) => {
                setRangeInput(event.target.value);
                resetFeedback();
              }}
            />
            {liveError ? (
              <span className="text-xs font-normal text-accent-violet">{liveError}</span>
            ) : (
              <span className="text-xs font-normal text-ink-500">{t("tools.remove-pdf-pages.ui.rangeHelp")}</span>
            )}
          </label>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.remove-pdf-pages.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.remove-pdf-pages.ui.outputIntro")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
            {t("toolUi.outputNameDownload")}
            <input
              className={inputClassName}
              value={outputBaseName}
              placeholder={localizedDefaultOutputBaseName}
              onChange={(event) => {
                setOutputBaseName(event.target.value);
                setHasCustomOutputName(true);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
          </label>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("tools.remove-pdf-pages.ui.processing")}
            </p>
          ) : null}

          {status === "success" && lastResult ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">
              {t("tools.remove-pdf-pages.ui.successSummary", { removed: lastResult.removed, remaining: lastResult.remaining })}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void handleRemove()} disabled={!canRemove}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {t("tools.remove-pdf-pages.ui.cta")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={!file && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>

          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-ink-500">
            <FileText className="mt-0.5 shrink-0 text-accent-teal" size={14} />
            {t("tools.remove-pdf-pages.ui.localProcessingNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
