import { Download, FileImage, Loader2, Maximize2, RotateCcw, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { OutputFormatSelector } from "../shared/OutputFormatSelector";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import {
  canExportBrowserImageFormat,
  jpegQualityPercentToDecimal,
  jpegQualityDecimalToPercent,
} from "../../../shared/utils/imageFiles";
import {
  buildResizedImageFileName,
  calculateResizeDimensions,
  defaultOutputBaseName,
  formatFileSize,
  getImageFormatLabel,
  getImageMimeLabel,
  getResizedImageOutputBaseName,
  maxImageDimension,
  readImageMetadata,
  resizeImageFile,
  validateImageDimensions,
} from "./imageResizer.service";
import type {
  ImageDimensions,
  ImageResizerMetadata,
  ImageResizerOutputFormat,
  ImageResizerResult,
  ImageResizerStatus,
} from "./imageResizer.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageResizerResult & {
  url: string;
};

const baseOutputFormats: ImageResizerOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageResizerOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "tools.image-resizer.ui.webp.desc",
};

function toPositiveInteger(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : Number.NaN;
}

export function ImageResizerTool() {
  const { t } = useI18n();
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageResizerMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [scaleInput, setScaleInput] = useState("100");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<ImageResizerOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageResizerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setWebpSupported(canExportBrowserImageFormat("webp"));
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const outputFormats = useMemo(
    () => (webpSupported ? [...baseOutputFormats, "webp" as const] : baseOutputFormats),
    [webpSupported],
  );
  const targetDimensions: ImageDimensions = {
    width: toPositiveInteger(widthInput),
    height: toPositiveInteger(heightInput),
  };
  const dimensionsError = metadata ? validateImageDimensions(targetDimensions) : null;
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const finalOutputFileName = buildResizedImageFileName(
    outputFileName,
    outputFormat,
    metadata ? getResizedImageOutputBaseName(metadata.fileName) : defaultOutputBaseName,
  );
  const canResize = Boolean(file && metadata) && !dimensionsError && status !== "reading" && status !== "processing";

  const deltaLabel = (() => {
    if (!result) return null;
    if (result.sizeDeltaBytes === 0) return t("tools.image-resizer.ui.sameSize");
    const absSize = formatFileSize(Math.abs(result.sizeDeltaBytes));
    const percent = Math.abs(result.sizeDeltaPercent).toFixed(1);
    if (result.sizeDeltaBytes > 0) return t("imageUi.increaseLabel", { size: absSize, percent });
    return t("imageUi.reductionLabel", { size: absSize, percent });
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

  const applyDimensions = (dimensions: ImageDimensions) => {
    setWidthInput(String(dimensions.width));
    setHeightInput(String(dimensions.height));
  };

  const updateWidth = (value: string) => {
    setWidthInput(value);
    resetFeedback();
    if (!metadata || !maintainAspectRatio) return;
    const width = toPositiveInteger(value);
    if (Number.isFinite(width) && width > 0) {
      applyDimensions(calculateResizeDimensions(metadata, "width", width, true));
      setScaleInput(String(Math.round((width / metadata.width) * 100)));
    }
  };

  const updateHeight = (value: string) => {
    setHeightInput(value);
    resetFeedback();
    if (!metadata || !maintainAspectRatio) return;
    const height = toPositiveInteger(value);
    if (Number.isFinite(height) && height > 0) {
      applyDimensions(calculateResizeDimensions(metadata, "height", height, true));
      setScaleInput(String(Math.round((height / metadata.height) * 100)));
    }
  };

  const updateScale = (value: string) => {
    setScaleInput(value);
    resetFeedback();
    if (!metadata) return;
    const scale = Number(value);
    if (Number.isFinite(scale) && scale > 0) {
      applyDimensions(calculateResizeDimensions(metadata, "scale", scale, true));
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

    const fileLimitError = limitLabels.getImageFileSizeLimitError(nextFile);
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
      setWidthInput(String(nextMetadata.width));
      setHeightInput(String(nextMetadata.height));
      setScaleInput("100");
      if (!hasCustomOutputFileName) {
        setOutputFileName(getResizedImageOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "imageUi.couldNotRead"));
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
    setWidthInput("");
    setHeightInput("");
    setScaleInput("100");
    setMaintainAspectRatio(true);
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resizeImage = async () => {
    if (!file || !canResize) return;
    setStatus("processing");
    setError(null);
    clearResult();
    try {
      const nextResult = await resizeImageFile(file, {
        height: targetDimensions.height,
        outputBaseName: outputFileName,
        outputFormat,
        quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
        width: targetDimensions.width,
      });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.image-resizer.ui.couldNotResize"));
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
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-resizer.ui.sourceTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.image-resizer.ui.intro")}</p>
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
          <p className="text-xs leading-5 text-ink-600">{t("tools.image-resizer.ui.maxLimits", { px: maxImageDimension })}</p>

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
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-resizer.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.image-resizer.ui.outputIntro")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <input
              checked={maintainAspectRatio}
              className="h-4 w-4 accent-accent-cyan"
              type="checkbox"
              onChange={(event) => {
                setMaintainAspectRatio(event.target.checked);
                resetFeedback();
              }}
            />
            {t("tools.image-resizer.ui.maintainRatio")}
          </label>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("tools.image-resizer.ui.width")}
              <input className={inputClassName} inputMode="numeric" value={widthInput} onChange={(event) => updateWidth(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("tools.image-resizer.ui.height")}
              <input className={inputClassName} inputMode="numeric" value={heightInput} onChange={(event) => updateHeight(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("tools.image-resizer.ui.scale")}
              <input className={inputClassName} inputMode="numeric" value={scaleInput} onChange={(event) => updateScale(event.target.value)} />
            </label>
          </div>

          {dimensionsError ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {t(dimensionsError.code as TranslationKey, dimensionsError.vars)}
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

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <OutputFormatSelector
              description={t(formatDescKeys[outputFormat])}
              formats={outputFormats}
              getLabel={getImageFormatLabel}
              label={t("imageUi.finalFormat")}
              value={outputFormat}
              onChange={(format) => {
                setOutputFormat(format);
                resetFeedback();
              }}
            />
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
              </label>
            ) : null}
          </div>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("tools.image-resizer.ui.resizing")}
            </p>
          ) : null}

          {result ? (
            <div className="grid gap-3 rounded-lg border border-accent-teal/25 bg-accent-teal/10 p-3 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{t("tools.image-resizer.ui.resultTitle")}</p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalDimensions")}</dt>
                  <dd className="font-semibold text-ink-900">
                    {result.width} × {result.height}px
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalFormat")}</dt>
                  <dd className="font-semibold text-ink-900">{getImageFormatLabel(result.format)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(result.size)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.difference")}</dt>
                  <dd className="font-semibold text-ink-900">{deltaLabel}</dd>
                </div>
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {t("imageUi.downloadImage")}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void resizeImage()} disabled={!canResize}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Maximize2 size={16} />}
              {t("tools.image-resizer.ui.resizeCta")}
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
