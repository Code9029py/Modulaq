import { Clipboard, Download, FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { cn } from "../../../shared/utils/cn";
import {
  defaultOutputBaseName,
  extractPdfText,
  formatFileSize,
  getSuggestedOutputBaseName,
  getTextFileName,
  isPdfFile,
  readPdfMetadata,
} from "./extractPdfText.service";
import type {
  ExtractPdfTextMetadata,
  ExtractPdfTextProgress,
  ExtractPdfTextResult,
  ExtractPdfTextStatus,
} from "./extractPdfText.types";

const acceptedPdfTypes = "application/pdf,.pdf";

export function ExtractPdfTextTool() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ExtractPdfTextMetadata | null>(null);
  const [result, setResult] = useState<ExtractPdfTextResult | null>(null);
  const [status, setStatus] = useState<ExtractPdfTextStatus>("idle");
  const [progress, setProgress] = useState<ExtractPdfTextProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preserveApproximateLineBreaks, setPreserveApproximateLineBreaks] = useState(true);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const isBusy = status === "reading" || status === "processing";
  const canExtract = Boolean(file && metadata) && !isBusy;
  const canExport = Boolean(result?.hasSelectableText && result.text);
  const fallbackOutputBaseName = metadata ? getSuggestedOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = getTextFileName(outputFileName, fallbackOutputBaseName);

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setFile(null);
    setMetadata(null);
    setResult(null);
    setProgress(null);
    setFeedback(null);
    setError(null);

    if (!isPdfFile(nextFile)) {
      setStatus("error");
      setError(t("toolUi.invalidPdfPicked"));
      return;
    }

    setStatus("reading");
    try {
      const nextMetadata = await readPdfMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSuggestedOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "toolUi.couldNotReadFile"));
    }
  };

  const clearSelection = () => {
    setFile(null);
    setMetadata(null);
    setResult(null);
    setStatus("idle");
    setProgress(null);
    setError(null);
    setFeedback(null);
    setIsDragging(false);
    setPreserveApproximateLineBreaks(true);
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runExtraction = async () => {
    if (!file || !canExtract) return;
    setStatus("processing");
    setResult(null);
    setProgress({ current: 0, total: metadata?.pageCount ?? 0 });
    setFeedback(null);
    setError(null);

    try {
      const nextResult = await extractPdfText(file, { preserveApproximateLineBreaks }, setProgress);
      setResult(nextResult);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.extract-pdf-text.ui.couldNotExtract"));
    }
  };

  const copyText = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setFeedback(t("toolUi.copiedShort"));
      setError(null);
    } catch {
      setError(t("toolUi.couldNotCopy"));
    }
  };

  const downloadText = () => {
    if (!result?.text) return;
    const url = URL.createObjectURL(new Blob([result.text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = finalOutputFileName;
    link.click();
    URL.revokeObjectURL(url);
    setError(null);
    setFeedback(t("toolUi.downloadedAs", { name: finalOutputFileName }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,1fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid min-w-0 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("toolUi.fileSection")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.extract-pdf-text.ui.intro")}</p>
          </div>

          <button
            className={cn(
              "grid min-h-40 place-items-center rounded-lg border border-dashed p-5 text-center transition",
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
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={23} />
              </span>
              <span className="mt-3 block text-base font-semibold text-ink-900">{t("toolUi.uploadPdf")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("toolUi.dropHere")}</span>
            </span>
          </button>

          <input
            ref={fileInputRef}
            accept={acceptedPdfTypes}
            className="hidden"
            type="file"
            onChange={(event) => {
              void processFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {metadata ? (
            <div className="min-w-0 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <p className="truncate text-sm font-semibold text-ink-900">{metadata.fileName}</p>
              <p className="mt-1 text-xs text-ink-500">
                {formatFileSize(metadata.fileSize)} · {metadata.pageCount} {metadata.pageCount === 1 ? t("toolUi.pagesSingular") : t("toolUi.pagesPlural")}
              </p>
            </div>
          ) : null}

          <label
            className={cn(
              "flex items-start gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm text-ink-700 shadow-sm",
              isBusy ? "cursor-not-allowed opacity-65" : "cursor-pointer",
            )}
          >
            <input
              checked={preserveApproximateLineBreaks}
              className="mt-0.5 h-4 w-4 accent-accent-teal"
              disabled={isBusy}
              type="checkbox"
              onChange={(event) => {
                setPreserveApproximateLineBreaks(event.target.checked);
                setResult(null);
                setFeedback(null);
                setError(null);
                setStatus(metadata ? "ready" : "idle");
              }}
            />
            <span>
              <span className="block font-semibold text-ink-900">{t("tools.extract-pdf-text.ui.preserveBreaks")}</span>
              <span className="mt-1 block text-xs leading-5 text-ink-500">
                {t("tools.extract-pdf-text.ui.preserveBreaksHelp")}
              </span>
            </span>
          </label>

          {status === "reading" || status === "processing" ? (
            <p
              aria-live="polite"
              role="status"
              className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm"
            >
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading"
                ? t("toolUi.readingPdf")
                : t("tools.extract-pdf-text.ui.extracting", {
                    current: progress?.current ?? 0,
                    total: progress?.total ?? metadata?.pageCount ?? 0,
                  })}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2">
            <Button type="button" className="gap-2" onClick={() => void runExtraction()} disabled={!canExtract}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              {t("tools.extract-pdf-text.ui.extractCta")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearSelection}
              disabled={!file && status === "idle" && !hasCustomOutputFileName}
            >
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.extract-pdf-text.ui.outputTitle")}</h3>
            <p aria-live="polite" className="mt-1 text-xs leading-5 text-ink-500">
              {result?.hasSelectableText
                ? t("tools.extract-pdf-text.ui.outputSummary", {
                    filled: result.pagesWithText,
                    total: result.pageCount,
                  })
                : t("tools.extract-pdf-text.ui.outputIntro")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyText()} disabled={!canExport}>
              <Clipboard size={16} />
              {t("toolUi.copy")}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={downloadText} disabled={!canExport}>
              <Download size={16} />
              {t("toolUi.downloadTxt")}
            </Button>
          </div>
        </div>

        {result?.likelyScanned ? (
          <p className="mt-4 rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm leading-6 text-ink-600">
            {t("tools.extract-pdf-text.ui.scanned")}
          </p>
        ) : null}

        {result?.hasProblematicSymbols ? (
          <p className="mt-4 rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm leading-6 text-ink-600">
            {t("tools.extract-pdf-text.ui.problematic")}
          </p>
        ) : null}

        {feedback ? (
          <p aria-live="polite" role="status" className="mt-4 rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">{feedback}</p>
        ) : null}

        <label className="mt-4 grid gap-1.5 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm font-semibold text-ink-700 shadow-sm">
          {t("toolUi.outputName")}
          <input
            className="min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
            value={outputFileName}
            placeholder={defaultOutputBaseName}
            onChange={(event) => {
              setOutputFileName(event.target.value);
              setHasCustomOutputFileName(true);
              setFeedback(null);
            }}
          />
          <span className="block break-all text-xs font-normal leading-5 text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
        </label>

        <textarea
          aria-label={t("tools.extract-pdf-text.ui.outputTitle")}
          className="mt-4 h-[29rem] w-full resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 p-4 text-sm leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
          placeholder={t("tools.extract-pdf-text.ui.placeholder")}
          readOnly
          value={result?.text ?? ""}
        />
      </section>
    </div>
  );
}
