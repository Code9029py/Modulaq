import { Download, FileImage, Loader2, RotateCcw, SlidersHorizontal, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { getImageFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import { canExportBrowserImageFormat, jpegQualityPercentToDecimal } from "../../../shared/utils/imageFiles";
import {
  buildCompressedImageFileName,
  compressImageFile,
  defaultCompressionQuality,
  defaultOutputBaseName,
  formatFileSize,
  getCompressedImageOutputBaseName,
  getImageFormatLabel,
  getImageMimeLabel,
  readImageMetadata,
} from "./imageCompressor.service";
import type {
  ImageCompressorMetadata,
  ImageCompressorOutputFormat,
  ImageCompressorResult,
  ImageCompressorStatus,
} from "./imageCompressor.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageCompressorResult & {
  url: string;
};

const fallbackOutputFormats: ImageCompressorOutputFormat[] = ["jpeg", "png"];

const formatDescKeys: Record<ImageCompressorOutputFormat, TranslationKey> = {
  png: "tools.image-compressor.ui.png.desc",
  jpeg: "tools.image-compressor.ui.jpg.desc",
  webp: "tools.image-compressor.ui.webp.desc",
};

export function ImageCompressorTool() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageCompressorMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageCompressorOutputFormat>("jpeg");
  const [qualityPercent, setQualityPercent] = useState(Math.round(defaultCompressionQuality * 100));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageCompressorStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const nextWebpSupported = canExportBrowserImageFormat("webp");
    setWebpSupported(nextWebpSupported);
    if (nextWebpSupported) setOutputFormat("webp");
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const outputFormats = useMemo(
    () => (webpSupported ? ["webp" as const, ...fallbackOutputFormats] : fallbackOutputFormats),
    [webpSupported],
  );
  const finalOutputFileName = buildCompressedImageFileName(
    outputFileName,
    outputFormat,
    metadata ? getCompressedImageOutputBaseName(metadata.fileName) : defaultOutputBaseName,
  );
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const transparencyWarning =
    outputFormat === "jpeg" && metadata?.mimeType !== "image/jpeg"
      ? t("imageUi.transparencyWarning")
      : null;
  const canCompress = Boolean(file && metadata) && status !== "reading" && status !== "processing";

  // Compute the size-change label inline using t() so we don't depend on
  // the service's Spanish output.
  const sizeChangeLabel = (() => {
    if (!result) return null;
    const sc = result.sizeChange;
    const absSize = formatFileSize(Math.abs(sc.deltaBytes));
    const percent = sc.percentage.toFixed(1);
    if (sc.direction === "reduction") {
      return t("imageUi.reductionLabel", { size: absSize, percent });
    }
    if (sc.direction === "increase") {
      return t("imageUi.increaseLabel", { size: absSize, percent });
    }
    return t("imageUi.sameSize");
  })();

  const clearResult = () => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
  };

  const resetFeedback = () => {
    setError(null);
    clearResult();
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setStatus("reading");
    setFile(null);
    setMetadata(null);
    setError(null);
    clearResult();

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
    }

    const fileLimitError = getImageFileSizeLimitError(nextFile);
    if (fileLimitError) {
      setStatus("error");
      setError(fileLimitError);
      return;
    }

    try {
      const nextMetadata = await readImageMetadata(nextFile);
      const nextPreviewUrl = URL.createObjectURL(nextFile);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setFile(nextFile);
      setMetadata(nextMetadata);
      if (!hasCustomOutputFileName) {
        setOutputFileName(getCompressedImageOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : t("imageUi.couldNotRead"));
    }
  };

  const clearSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    clearResult();
    setFile(null);
    setMetadata(null);
    setPreviewUrl(null);
    setOutputFormat(webpSupported ? "webp" : "jpeg");
    setQualityPercent(Math.round(defaultCompressionQuality * 100));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const compressImage = async () => {
    if (!file || !canCompress) return;
    setStatus("processing");
    setError(null);
    clearResult();
    try {
      const nextResult = await compressImageFile(file, {
        outputBaseName: outputFileName,
        outputFormat,
        quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
      });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : t("tools.image-compressor.ui.couldNotCompress"));
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    link.click();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.96fr)_minmax(310px,0.52fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-compressor.ui.sourceTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.image-compressor.ui.intro")}</p>
          </div>

          <button
            className={cn(
              "grid min-h-52 place-items-center rounded-lg border border-dashed p-6 text-center transition",
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
              <span className="mt-4 block text-base font-semibold text-ink-900">{t("imageUi.selectImage")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("imageUi.dropImageHint")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{t("imageUi.maxSize")}</p>

          <input
            ref={fileInputRef}
            accept={acceptedImageTypes}
            className="hidden"
            type="file"
            onChange={(event) => {
              void processFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {metadata ? (
            <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[128px_minmax(0,1fr)]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-28 w-full rounded-lg border border-surface-200/80 bg-surface-50 object-contain shadow-sm sm:w-32"
                />
              ) : (
                <span className="grid h-28 w-full place-items-center rounded-lg border border-surface-200/80 bg-surface-50 text-accent-teal sm:w-32">
                  <FileImage size={28} />
                </span>
              )}
              <dl className="grid min-w-0 gap-2 text-sm">
                <div>
                  <dt className="text-ink-500">{t("imageUi.fileName")}</dt>
                  <dd className="truncate font-semibold text-ink-900">{metadata.fileName}</dd>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-ink-500">{t("imageUi.type")}</dt>
                    <dd className="font-semibold text-ink-900">{getImageMimeLabel(metadata.mimeType)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-500">{t("imageUi.originalSize")}</dt>
                    <dd className="font-semibold text-ink-900">{formatFileSize(metadata.fileSize)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-500">{t("imageUi.dimensions")}</dt>
                    <dd className="font-semibold text-ink-900">
                      {metadata.width} × {metadata.height}px
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          ) : null}

          {status === "reading" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("imageUi.reading")}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-compressor.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.image-compressor.ui.outputIntro")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid gap-2">
            {outputFormats.map((format) => (
              <button
                key={format}
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  outputFormat === format
                    ? "border-accent-cyan/45 bg-accent-cyan/10"
                    : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setOutputFormat(format);
                  resetFeedback();
                }}
              >
                <span className="block text-sm font-semibold text-ink-900">{getImageFormatLabel(format)}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">{t(formatDescKeys[format])}</span>
              </button>
            ))}
          </div>

          {!webpSupported ? (
            <p className="text-xs leading-5 text-ink-500">{t("imageUi.webpUnavailable")}</p>
          ) : null}

          {shouldShowQuality ? (
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("imageUi.qualityLabel", { format: getImageFormatLabel(outputFormat), percent: qualityPercent })}
              <input
                className="w-full accent-accent-cyan"
                min={10}
                max={100}
                step={1}
                type="range"
                value={qualityPercent}
                onChange={(event) => {
                  setQualityPercent(Number(event.target.value));
                  resetFeedback();
                }}
              />
              <span className="text-xs font-normal leading-5 text-ink-500">{t("tools.image-compressor.ui.qualityNote")}</span>
            </label>
          ) : (
            <p className="text-xs leading-5 text-ink-500">{t("tools.image-compressor.ui.pngNoQuality")}</p>
          )}

          {transparencyWarning ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {transparencyWarning}
            </p>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("imageUi.outputName")}
            <input
              className={cn(inputClassName, "w-full")}
              value={outputFileName}
              placeholder={defaultOutputBaseName}
              onChange={(event) => {
                setOutputFileName(event.target.value);
                setHasCustomOutputFileName(true);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal leading-5 text-ink-500">{t("imageUi.willPrepareAs", { name: finalOutputFileName })}</span>
          </label>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("tools.image-compressor.ui.compressing")}
            </p>
          ) : null}

          {result && metadata ? (
            <div
              className={cn(
                "grid gap-3 rounded-lg border p-3 text-sm",
                result.sizeChange.direction === "increase"
                  ? "border-accent-violet/20 bg-accent-violet/8 text-ink-600"
                  : "border-accent-teal/25 bg-accent-teal/10 text-ink-700",
              )}
            >
              <p className="font-semibold text-ink-900">
                {result.sizeChange.direction === "increase"
                  ? t("tools.image-compressor.ui.resultLarger")
                  : t("tools.image-compressor.ui.resultReady")}
              </p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">{t("imageUi.originalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(metadata.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(result.size)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.difference")}</dt>
                  <dd className="font-semibold text-ink-900">{sizeChangeLabel}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalFormat")}</dt>
                  <dd className="font-semibold text-ink-900">{getImageFormatLabel(result.format)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalDimensions")}</dt>
                  <dd className="font-semibold text-ink-900">
                    {result.width} × {result.height}px
                  </dd>
                </div>
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {t("imageUi.downloadImage")}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void compressImage()} disabled={!canCompress}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <SlidersHorizontal size={16} />}
              {t("tools.image-compressor.ui.compressCta")}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {t("imageUi.selectImage")}
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
