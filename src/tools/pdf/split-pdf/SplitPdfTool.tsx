import { FileArchive, FileText, Loader2, RotateCcw, Scissors, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { HelpHint } from "../../../shared/components/HelpHint";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import {
  buildOutputFileName,
  createZipFromParts,
  defaultOutputBaseName,
  extractSelectedPages,
  formatFileSize,
  getOutputBaseNameError,
  getSuggestedOutputBaseName,
  isPdfFile,
  parsePageSelection,
  readPdfMetadata,
  splitPdfIntoIndividualPages,
  validateParts,
} from "./splitPdf.service";
import type { SplitPdfMetadata, SplitPdfMode, SplitPdfStatus } from "./splitPdf.types";

const acceptedPdfTypes = "application/pdf,.pdf";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

const modeKeys: Record<SplitPdfMode, { button: TranslationKey; description: TranslationKey; label: TranslationKey; shortDescription: TranslationKey }> = {
  "extract-pages": {
    button: "tools.split-pdf.ui.modeRangeBtn",
    description: "tools.split-pdf.ui.modeRangeDesc",
    label: "tools.split-pdf.ui.modeRangeLabel",
    shortDescription: "tools.split-pdf.ui.modeRangeShort",
  },
  parts: {
    button: "tools.split-pdf.ui.modePartsBtn",
    description: "tools.split-pdf.ui.modePartsDesc",
    label: "tools.split-pdf.ui.modePartsLabel",
    shortDescription: "tools.split-pdf.ui.modePartsShort",
  },
  "individual-pages": {
    button: "tools.split-pdf.ui.modeAllBtn",
    description: "tools.split-pdf.ui.modeAllDesc",
    label: "tools.split-pdf.ui.modeAllLabel",
    shortDescription: "tools.split-pdf.ui.modeAllShort",
  },
};

export function SplitPdfTool() {
  const { t } = useI18n();
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<SplitPdfMetadata | null>(null);
  const [mode, setMode] = useState<SplitPdfMode>("extract-pages");
  const [pageSelection, setPageSelection] = useState("1");
  const [partCount, setPartCount] = useState(2);
  const [parts, setParts] = useState<string[]>(["", ""]);
  const [outputBaseName, setOutputBaseName] = useState(defaultOutputBaseName);
  const [hasCustomOutputBaseName, setHasCustomOutputBaseName] = useState(false);
  const [status, setStatus] = useState<SplitPdfStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);

  const selectionValidation = useMemo(() => {
    if (!metadata || mode !== "extract-pages") {
      return null;
    }
    return parsePageSelection(pageSelection, metadata.pageCount);
  }, [metadata, mode, pageSelection]);
  const partsValidation = useMemo(() => {
    if (!metadata || mode !== "parts") {
      return null;
    }
    return validateParts(parts, metadata.pageCount);
  }, [metadata, mode, parts]);
  const outputExtension = mode === "extract-pages" || (mode === "individual-pages" && metadata?.pageCount === 1) ? "pdf" : "zip";
  const fallbackOutputBaseName = metadata ? getSuggestedOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const outputNameError = getOutputBaseNameError(outputBaseName);
  const outputFileName = outputNameError
    ? null
    : buildOutputFileName(outputBaseName, outputExtension, fallbackOutputBaseName);
  const modeError =
    mode === "extract-pages" ? selectionValidation?.error : mode === "parts" ? partsValidation?.error : null;
  const isBusy = status === "reading" || status === "processing";
  const partsModeUnavailable = Boolean(metadata && metadata.pageCount < 2);
  const generatedOutputLimitError =
    mode === "individual-pages" && metadata
      ? limitLabels.getSplitPagesLimitError(metadata.pageCount)
      : null;
  const canProcess =
    Boolean(file && metadata) &&
    !isBusy &&
    !modeError &&
    !outputNameError &&
    !generatedOutputLimitError &&
    !(mode === "parts" && partsModeUnavailable);

  const resetFeedback = () => {
    setError(null);
    setLastOutput(null);
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setFile(null);
    setMetadata(null);
    setLastOutput(null);
    setError(null);

    if (!isPdfFile(nextFile)) {
      setStatus("error");
      setError(t("toolUi.invalidPdfPicked"));
      return;
    }

    const fileLimitError = limitLabels.getPdfFileSizeLimitError(nextFile);
    if (fileLimitError) {
      setStatus("error");
      setError(fileLimitError);
      return;
    }

    setStatus("reading");
    try {
      const nextMetadata = await readPdfMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      if (!hasCustomOutputBaseName) {
        setOutputBaseName(getSuggestedOutputBaseName(nextFile.name));
      }
      setPageSelection(`1-${nextMetadata.pageCount}`);
      setPartCount(2);
      setParts(["", ""]);
      if (mode === "parts" && nextMetadata.pageCount < 2) {
        setMode("extract-pages");
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
    setMode("extract-pages");
    setPageSelection("1");
    setPartCount(2);
    setParts(["", ""]);
    setOutputBaseName(defaultOutputBaseName);
    setHasCustomOutputBaseName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    setLastOutput(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectMode = (nextMode: SplitPdfMode) => {
    if (nextMode === "parts" && partsModeUnavailable) return;
    setMode(nextMode);
    resetFeedback();
  };

  const changePartCount = (nextCount: number) => {
    setPartCount(nextCount);
    setParts((currentParts) => Array.from({ length: nextCount }, (_, index) => currentParts[index] ?? ""));
    resetFeedback();
  };

  const changePart = (index: number, value: string) => {
    setParts((currentParts) => currentParts.map((part, partIndex) => (partIndex === index ? value : part)));
    resetFeedback();
  };

  const downloadResult = (bytes: ArrayBuffer, mimeType: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const splitPdf = async () => {
    if (!file || !canProcess) return;
    setStatus("processing");
    setError(null);
    setLastOutput(null);

    try {
      const result =
        mode === "extract-pages"
          ? await extractSelectedPages(file, pageSelection, outputBaseName)
          : mode === "parts"
            ? await createZipFromParts(file, parts, outputBaseName)
            : await splitPdfIntoIndividualPages(file, outputBaseName);

      downloadResult(result.bytes, result.mimeType, result.fileName);

      if (mode === "extract-pages") {
        const label = result.pageCount === 1 ? t("toolUi.pagesSingular") : t("toolUi.pagesPlural");
        setLastOutput(t("tools.split-pdf.ui.successOne", { name: result.fileName, count: result.pageCount, label }));
      } else {
        const label =
          mode === "parts"
            ? result.outputCount === 1
              ? t("tools.split-pdf.ui.successOnePartLabel")
              : t("tools.split-pdf.ui.successPartsLabel")
            : result.outputCount === 1
              ? t("tools.split-pdf.ui.successIndividualOne")
              : t("tools.split-pdf.ui.successIndividualMany");
        setLastOutput(
          `${t("tools.split-pdf.ui.successOne", { name: result.fileName, count: result.outputCount, label })}`,
        );
      }

      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.split-pdf.ui.couldNotSplit"));
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(310px,0.54fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.split-pdf.ui.section")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.split-pdf.ui.intro2")}</p>
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
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("tools.split-pdf.ui.dropHintShort")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{limitLabels.splitPdf}</p>

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

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t("tools.split-pdf.ui.modeLabel")}</p>
            <div className="grid gap-2 lg:grid-cols-3">
              {(Object.keys(modeKeys) as SplitPdfMode[]).map((modeId) => (
                <button
                  key={modeId}
                  type="button"
                  disabled={modeId === "parts" && partsModeUnavailable}
                  className={cn(
                    "rounded-md border p-3 text-left transition",
                    mode === modeId
                      ? "border-accent-cyan/45 bg-accent-cyan/10"
                      : "border-surface-200/80 bg-surface-50/80 hover:border-accent-cyan/35",
                    modeId === "parts" && partsModeUnavailable && "cursor-not-allowed opacity-50",
                  )}
                  onClick={() => selectMode(modeId)}
                >
                  <span className="block text-sm font-semibold text-ink-900">{t(modeKeys[modeId].label)}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink-500">{t(modeKeys[modeId].shortDescription)}</span>
                </button>
              ))}
            </div>
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm leading-6 text-ink-500 shadow-sm">
              {mode === "individual-pages" && metadata?.pageCount === 1
                ? t("tools.split-pdf.ui.singlePageNotice")
                : t(modeKeys[mode].description)}
            </p>
            {generatedOutputLimitError ? <p role="alert" className="text-sm text-ink-700">{generatedOutputLimitError}</p> : null}
          </div>

          {mode === "extract-pages" ? (
            <div className="grid gap-2 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <label htmlFor="split-pdf-page-selection" className="text-sm font-semibold text-ink-700">
                  {t("tools.split-pdf.ui.pagesToExtract")}
                </label>
                <HelpHint id="split-pdf-page-selection-help" text={t("tools.split-pdf.ui.extractPagesHelp")} />
              </div>
              <input
                id="split-pdf-page-selection"
                className={inputClassName}
                placeholder={t("tools.split-pdf.ui.pagesPlaceholder")}
                type="text"
                value={pageSelection}
                onChange={(event) => {
                  setPageSelection(event.target.value);
                  resetFeedback();
                }}
              />
              <p className="text-xs leading-5 text-ink-500">{t("tools.split-pdf.ui.pagesHelp")}</p>
              {selectionValidation?.error ? <p role="alert" className="text-sm text-ink-700">{t(selectionValidation.error.code as TranslationKey, selectionValidation.error.vars)}</p> : null}
              {!selectionValidation?.error && selectionValidation?.isOutOfOrder ? (
                <p className="rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-3 py-2 text-sm text-ink-700">
                  {t("tools.split-pdf.ui.pagesOutOfOrder")}
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === "parts" ? (
            <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <label className="grid gap-1.5 text-sm font-semibold text-ink-700 sm:max-w-48">
                {t("tools.split-pdf.ui.partsCountLabel")}
                <select
                  className={inputClassName}
                  disabled={!metadata || metadata.pageCount < 2}
                  value={partCount}
                  onChange={(event) => changePartCount(Number(event.target.value))}
                >
                  {!metadata || metadata.pageCount < 2 ? <option value={2}>{t("tools.split-pdf.ui.uploadFirst")}</option> : null}
                  {metadata && metadata.pageCount >= 2
                    ? Array.from({ length: metadata.pageCount - 1 }, (_, index) => index + 2).map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))
                    : null}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {parts.map((part, index) => (
                  <div key={index} className="grid gap-1.5">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`split-pdf-part-${index + 1}`} className="text-sm font-semibold text-ink-700">
                        {t("tools.split-pdf.ui.partLabel", { number: index + 1 })}
                      </label>
                      <HelpHint id={`split-pdf-part-${index + 1}-help`} text={t("tools.split-pdf.ui.partsHelp")} />
                    </div>
                    <input
                      id={`split-pdf-part-${index + 1}`}
                      className={inputClassName}
                      placeholder={index === 0 ? t("tools.split-pdf.ui.partPlaceholderFirst") : t("tools.split-pdf.ui.partPlaceholderRest")}
                      type="text"
                      value={part}
                      onChange={(event) => changePart(index, event.target.value)}
                    />
                  </div>
                ))}
              </div>

              {metadata && partsValidation ? (
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    partsValidation.isValid
                      ? "border-accent-teal/25 bg-accent-teal/10 text-ink-700"
                      : "border-accent-violet/20 bg-accent-violet/8 text-ink-600",
                  )}
                >
                  <p className="font-semibold">
                    {t("tools.split-pdf.ui.assignedSummary", {
                      assigned: partsValidation.assignedPageCount,
                      total: metadata.pageCount,
                    })}
                  </p>
                  <p className="mt-1">
                    {partsValidation.isValid
                      ? t("tools.split-pdf.ui.assignedReady")
                      : partsValidation.error
                        ? t(partsValidation.error.code as TranslationKey, partsValidation.error.vars)
                        : null}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.split-pdf.ui.resultTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.split-pdf.ui.resultIntro2")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">{t("tools.split-pdf.ui.totalPages")}</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{metadata?.pageCount ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">
              {metadata?.pageCount === 1 ? t("tools.split-pdf.ui.pageDetected") : t("tools.split-pdf.ui.pagesDetected")}
            </p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">{t("tools.split-pdf.ui.selectedMode")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">{t(modeKeys[mode].label)}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">
                <label htmlFor="split-pdf-output-name">{t("tools.split-pdf.ui.outputName")}</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="split-pdf-output-name"
                  className={cn(inputClassName, "w-full")}
                  value={outputBaseName}
                  placeholder={defaultOutputBaseName}
                  onChange={(event) => {
                    setOutputBaseName(event.target.value);
                    setHasCustomOutputBaseName(true);
                    resetFeedback();
                  }}
                />
                <span className="mt-2 block text-xs leading-5 text-ink-500">
                  {t("tools.split-pdf.ui.outputNameHelp")}
                </span>
                {outputNameError ? <span role="alert" className="mt-2 block text-sm text-ink-700">{t(outputNameError.code as TranslationKey)}</span> : null}
              </dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">{t("tools.split-pdf.ui.finalDownload")}</dt>
              <dd className="mt-1 break-all font-semibold text-ink-900">{outputFileName ?? t("tools.split-pdf.ui.outputNameInvalid")}</dd>
              <dd className="mt-1 text-xs text-ink-500">
                {outputExtension === "pdf" ? t("tools.split-pdf.ui.archivePdf") : t("tools.split-pdf.ui.archiveZip")}
              </dd>
            </div>
          </dl>

          {status === "reading" || status === "processing" ? (
            <p
              aria-live="polite"
              role="status"
              className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm"
            >
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading" ? t("toolUi.readingPdf") : t("tools.split-pdf.ui.preparing")}
            </p>
          ) : null}

          {status === "success" && lastOutput ? (
            <p aria-live="polite" role="status" className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">{lastOutput}</p>
          ) : null}

          {status === "error" && error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          {!metadata && status === "idle" ? (
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              {t("tools.split-pdf.ui.pickFirst")}
            </p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void splitPdf()} disabled={!canProcess}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Scissors size={16} />}
              {t(modeKeys[mode].button)}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              {outputExtension === "zip" ? <FileArchive size={16} /> : <FileText size={16} />}
              {t("toolUi.uploadPdf")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearSelection}
              disabled={!file && status === "idle" && !hasCustomOutputBaseName}
            >
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
