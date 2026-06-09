import { Download, FileArchive, FileImage, Loader2, RotateCcw, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { HelpHint } from "../../../shared/components/HelpHint";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import {
  buildImageDownloadFileName,
  buildImageZipDownloadFileName,
  jpegQualityPercentToDecimal,
} from "../../../shared/utils/imageFiles";
import {
  convertPdfPagesToImages,
  createAllPageNumbers,
  defaultOutputBaseName,
  formatFileSize,
  isPdfFile,
  parsePageRange,
  readPdfMetadata,
} from "./pdfToImages.service";
import type {
  PdfToImagesMetadata,
  PdfToImagesMode,
  PdfToImagesOutputFormat,
  PdfToImagesProgress,
  PdfToImagesStatus,
} from "./pdfToImages.types";

const acceptedPdfTypes = "application/pdf,.pdf";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

export function PdfToImagesTool() {
  const { t } = useI18n();
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfToImagesMetadata | null>(null);
  const [mode, setMode] = useState<PdfToImagesMode>("all-pages");
  const [rangeInput, setRangeInput] = useState("1");
  const [status, setStatus] = useState<PdfToImagesStatus>("idle");
  const [progress, setProgress] = useState<PdfToImagesProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [outputFormat, setOutputFormat] = useState<PdfToImagesOutputFormat>("png");
  const [jpegQualityPercent, setJpegQualityPercent] = useState(92);

  const rangeValidation = useMemo(() => {
    if (!metadata || mode !== "page-range") return null;
    return parsePageRange(rangeInput, metadata.pageCount);
  }, [metadata, mode, rangeInput]);
  const selectedPages =
    metadata && mode === "all-pages"
      ? createAllPageNumbers(metadata.pageCount)
      : rangeValidation?.pages ?? [];
  const imageCount = selectedPages.length;
  const fallbackOutputBaseName = metadata
    ? getSuggestedDownloadBaseName(metadata.fileName, defaultOutputBaseName)
    : defaultOutputBaseName;
  const finalOutputFileName =
    imageCount === 1
      ? buildImageDownloadFileName(outputFileName, outputFormat, fallbackOutputBaseName)
      : buildImageZipDownloadFileName(outputFileName, fallbackOutputBaseName);
  const outputFormatLabel = outputFormat === "png" ? "PNG" : "JPG";
  const outputType =
    imageCount === 0
      ? t("tools.pdf-to-images.ui.bySelection")
      : imageCount === 1
        ? t("tools.pdf-to-images.ui.individualFile", { format: outputFormatLabel })
        : t("tools.pdf-to-images.ui.zipArchive");
  const isBusy = status === "reading" || status === "processing";
  const generatedOutputLimitError = imageCount > 0 ? limitLabels.getConvertPagesLimitError(imageCount) : null;
  const canConvert = Boolean(file && metadata) && !isBusy && imageCount > 0 && !rangeValidation?.error && !generatedOutputLimitError;

  const resetFeedback = () => {
    setError(null);
    setLastOutput(null);
    setProgress(null);
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setFile(null);
    setMetadata(null);
    setProgress(null);
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
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSuggestedDownloadBaseName(nextFile.name, defaultOutputBaseName));
      }
      setMode("all-pages");
      setRangeInput(`1-${nextMetadata.pageCount}`);
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "toolUi.couldNotReadFile"));
    }
  };

  const clearSelection = () => {
    setFile(null);
    setMetadata(null);
    setMode("all-pages");
    setRangeInput("1");
    setStatus("idle");
    setProgress(null);
    setError(null);
    setIsDragging(false);
    setLastOutput(null);
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setOutputFormat("png");
    setJpegQualityPercent(92);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadResult = (bytes: ArrayBuffer, mimeType: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertPages = async () => {
    if (!file || !canConvert) return;
    setStatus("processing");
    setError(null);
    setLastOutput(null);
    setProgress({ current: 0, total: imageCount });

    try {
      const result = await convertPdfPagesToImages(
        file,
        selectedPages,
        outputFileName,
        outputFormat,
        jpegQualityPercentToDecimal(jpegQualityPercent),
        setProgress,
      );
      downloadResult(result.bytes, result.mimeType, result.fileName);
      setLastOutput(
        result.imageCount === 1
          ? t("tools.pdf-to-images.ui.downloadedOne", { name: result.fileName })
          : t("tools.pdf-to-images.ui.downloadedMany", { name: result.fileName, count: result.imageCount, format: outputFormatLabel }),
      );
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.pdf-to-images.ui.couldNotConvertPages"));
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(310px,0.54fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.pdf-to-images.ui.section2")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.pdf-to-images.ui.intro2")}</p>
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
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("tools.pdf-to-images.ui.dropHint")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{limitLabels.pdfToImages}</p>

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

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t("tools.pdf-to-images.ui.rangeLabel")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "all-pages"
                    ? "border-accent-cyan/45 bg-accent-cyan/10"
                    : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("all-pages");
                  resetFeedback();
                }}
              >
                <span className="block text-sm font-semibold text-ink-900">{t("tools.pdf-to-images.ui.modeAllTitle")}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.modeAllShort")}</span>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "page-range"
                    ? "border-accent-cyan/45 bg-accent-cyan/10"
                    : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("page-range");
                  resetFeedback();
                }}
              >
                <span className="block text-sm font-semibold text-ink-900">{t("tools.pdf-to-images.ui.modeRangeTitle")}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.modeRangeShort")}</span>
              </button>
            </div>

            {mode === "page-range" ? (
              <div className="grid gap-1.5 text-sm font-semibold text-ink-700">
                <div className="flex items-center gap-2">
                  <label htmlFor="pdf-to-images-range">{t("tools.pdf-to-images.ui.rangeLabel")}</label>
                  <HelpHint id="pdf-to-images-range-help" text={t("tools.pdf-to-images.ui.pageRangeHelp")} />
                </div>
                <input
                  id="pdf-to-images-range"
                  className={inputClassName}
                  placeholder={t("tools.pdf-to-images.ui.rangePlaceholder")}
                  type="text"
                  value={rangeInput}
                  onChange={(event) => {
                    setRangeInput(event.target.value);
                    resetFeedback();
                  }}
                />
                <span className="text-xs font-normal leading-5 text-ink-500">{t("tools.pdf-to-images.ui.rangeHelp")}</span>
                {rangeValidation?.error ? <span role="alert" className="text-sm font-normal text-ink-700">{rangeValidation.error}</span> : null}
                {!rangeValidation?.error && rangeValidation?.duplicatesRemoved ? (
                  <span className="text-xs font-normal leading-5 text-ink-500">{t("tools.pdf-to-images.ui.duplicatesRemoved")}</span>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t("tools.pdf-to-images.ui.formatTitle")}</p>
                <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.formatIntro")}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-md border p-3 text-left transition",
                    outputFormat === "png"
                      ? "border-accent-cyan/45 bg-accent-cyan/10"
                      : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                  )}
                  onClick={() => {
                    setOutputFormat("png");
                    resetFeedback();
                  }}
                >
                  <span className="block text-sm font-semibold text-ink-900">PNG</span>
                  <span className="mt-1 block text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.pngDesc")}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md border p-3 text-left transition",
                    outputFormat === "jpeg"
                      ? "border-accent-cyan/45 bg-accent-cyan/10"
                      : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                  )}
                  onClick={() => {
                    setOutputFormat("jpeg");
                    resetFeedback();
                  }}
                >
                  <span className="block text-sm font-semibold text-ink-900">JPG</span>
                  <span className="mt-1 block text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.jpgDesc")}</span>
                </button>
              </div>

              {outputFormat === "jpeg" ? (
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {t("tools.pdf-to-images.ui.qualityFull", { percent: jpegQualityPercent })}
                  <input
                    className="w-full accent-accent-cyan"
                    min={10}
                    max={100}
                    step={1}
                    type="range"
                    value={jpegQualityPercent}
                    onChange={(event) => {
                      setJpegQualityPercent(Number(event.target.value));
                      resetFeedback();
                    }}
                  />
                  <span className="text-xs font-normal leading-5 text-ink-500">{t("tools.pdf-to-images.ui.qualityHelp")}</span>
                </label>
              ) : null}
            </div>
            {generatedOutputLimitError ? <p role="alert" className="text-sm text-ink-700">{generatedOutputLimitError}</p> : null}
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.pdf-to-images.ui.resultTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.pdf-to-images.ui.resultIntro2", { format: outputFormatLabel })}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">{t("tools.pdf-to-images.ui.imagesToGenerate")}</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{imageCount}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">
              {imageCount === 1
                ? t("tools.pdf-to-images.ui.imageFormat", { format: outputFormatLabel })
                : t("tools.pdf-to-images.ui.imagesFormat", { format: outputFormatLabel })}
            </p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">
                <label htmlFor="pdf-to-images-output-name">{t("toolUi.outputName")}</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="pdf-to-images-output-name"
                  className={cn(inputClassName, "w-full")}
                  value={outputFileName}
                  placeholder={defaultOutputBaseName}
                  onChange={(event) => {
                    setOutputFileName(event.target.value);
                    setHasCustomOutputFileName(true);
                    resetFeedback();
                  }}
                />
                <span className="mt-2 block break-all text-xs text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
              </dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">{t("tools.pdf-to-images.ui.downloadFile")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">{outputType}</dd>
              <dd className="mt-1 text-xs text-ink-500">{t("tools.pdf-to-images.ui.imageFormatLabel", { format: outputFormatLabel })}</dd>
            </div>
          </dl>

          {status === "reading" || status === "processing" ? (
            <p
              aria-live="polite"
              role="status"
              className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm"
            >
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading"
                ? t("toolUi.readingPdf")
                : t("tools.pdf-to-images.ui.processingPage", { current: progress?.current ?? 0, total: progress?.total ?? imageCount })}
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
              {t("tools.pdf-to-images.ui.pickPdfFirst")}
            </p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void convertPages()} disabled={!canConvert}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {t("tools.pdf-to-images.ui.convertCta")}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              {imageCount > 1 ? <FileArchive size={16} /> : <FileImage size={16} />}
              {t("toolUi.uploadPdf")}
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
    </div>
  );
}
