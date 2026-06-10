import {
  Download,
  FileImage,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  RotateCcw,
  RotateCw,
  Upload,
} from "lucide-react";
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
  jpegQualityDecimalToPercent,
  jpegQualityPercentToDecimal,
} from "../../../shared/utils/imageFiles";
import {
  applyImageRotatorAction,
  buildRotatedImageFileName,
  defaultOutputBaseName,
  defaultTransform,
  formatFileSize,
  getImageFormatLabel,
  getImageMimeLabel,
  getRotatedImageOutputBaseName,
  getTransformedImageDimensions,
  hasImageTransform,
  readImageMetadata,
  rotateImageFile,
} from "./imageRotator.service";
import type {
  ImageRotatorAction,
  ImageRotatorMetadata,
  ImageRotatorOutputFormat,
  ImageRotatorResult,
  ImageRotatorStatus,
  ImageRotatorTransform,
} from "./imageRotator.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageRotatorResult & {
  url: string;
};

const baseOutputFormats: ImageRotatorOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageRotatorOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const actionOrder: ImageRotatorAction[] = [
  "rotate-right",
  "rotate-left",
  "rotate-180",
  "flip-horizontal",
  "flip-vertical",
];

const actionIcons: Record<ImageRotatorAction, typeof RotateCw> = {
  "flip-horizontal": FlipHorizontal2,
  "flip-vertical": FlipVertical2,
  "rotate-180": RotateCw,
  "rotate-left": RotateCcw,
  "rotate-right": RotateCw,
};

const copy = {
  es: {
    actionsTitle: "Acciones",
    applyCta: "Preparar imagen",
    downloadReady: "Imagen lista",
    flipHorizontal: "Voltear horizontal",
    flipVertical: "Voltear vertical",
    noImage: "Selecciona una imagen para habilitar las acciones.",
    outputIntro: "El resultado se genera desde un canvas local.",
    outputTitle: "Vista previa y salida",
    previewAlt: "Vista previa de la imagen transformada",
    processing: "Preparando imagen...",
    resetActions: "Restablecer acciones",
    rotate180: "Rotar 180",
    rotateLeft: "90 izquierda",
    rotateRight: "90 derecha",
    sourceIntro: "Rota o voltea una imagen sin perder calidad.",
    sourceTitle: "Archivo y rotacion",
    transformLabel: "Transformacion",
    unchanged: "Sin cambios",
    webpHint: "WebP aparece si tu navegador permite exportarlo correctamente.",
  },
  en: {
    actionsTitle: "Actions",
    applyCta: "Prepare image",
    downloadReady: "Image ready",
    flipHorizontal: "Flip horizontal",
    flipVertical: "Flip vertical",
    noImage: "Select an image to enable actions.",
    outputIntro: "The result is generated from a local canvas.",
    outputTitle: "Preview and output",
    previewAlt: "Preview of the transformed image",
    processing: "Preparing image...",
    resetActions: "Reset actions",
    rotate180: "Rotate 180",
    rotateLeft: "90 left",
    rotateRight: "90 right",
    sourceIntro: "Rotate or flip an image without losing quality.",
    sourceTitle: "File and rotation",
    transformLabel: "Transform",
    unchanged: "No changes",
    webpHint: "WebP appears if your browser can export it correctly.",
  },
} as const;

function getPreviewTransform(transform: ImageRotatorTransform) {
  return `rotate(${transform.rotation}deg) scale(${transform.flipHorizontal ? -1 : 1}, ${
    transform.flipVertical ? -1 : 1
  })`;
}

function getTransformSummary(transform: ImageRotatorTransform, labels: (typeof copy)["es" | "en"]) {
  const parts: string[] = [];

  if (transform.rotation !== 0) {
    parts.push(`${transform.rotation}deg`);
  }

  if (transform.flipHorizontal) {
    parts.push(labels.flipHorizontal);
  }

  if (transform.flipVertical) {
    parts.push(labels.flipVertical);
  }

  return parts.length > 0 ? parts.join(" + ") : labels.unchanged;
}

export function ImageRotatorTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageRotatorMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transform, setTransform] = useState<ImageRotatorTransform>(defaultTransform);
  const [outputFormat, setOutputFormat] = useState<ImageRotatorOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageRotatorStatus>("idle");
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
  const outputDimensions = metadata
    ? getTransformedImageDimensions({ height: metadata.height, width: metadata.width }, transform)
    : null;
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const finalOutputFileName = buildRotatedImageFileName(
    outputFileName,
    outputFormat,
    metadata ? getRotatedImageOutputBaseName(metadata.fileName) : defaultOutputBaseName,
  );
  const canRotate = Boolean(file && metadata) && status !== "reading" && status !== "processing";

  const actionLabels: Record<ImageRotatorAction, string> = {
    "flip-horizontal": labels.flipHorizontal,
    "flip-vertical": labels.flipVertical,
    "rotate-180": labels.rotate180,
    "rotate-left": labels.rotateLeft,
    "rotate-right": labels.rotateRight,
  };

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
    setTransform(defaultTransform);
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
      if (!hasCustomOutputFileName) {
        setOutputFileName(getRotatedImageOutputBaseName(nextFile.name));
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
    setTransform(defaultTransform);
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyAction = (action: ImageRotatorAction) => {
    setTransform((current) => applyImageRotatorAction(current, action));
    resetFeedback();
  };

  const rotateImage = async () => {
    if (!file || !canRotate) return;
    setStatus("processing");
    setError(null);
    clearResult();
    try {
      const nextResult = await rotateImageFile(file, {
        outputBaseName: outputFileName,
        outputFormat,
        quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
        transform,
      });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.imageExportFailed"));
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
            <h3 className="text-sm font-semibold text-ink-900">{labels.sourceTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{labels.sourceIntro}</p>
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
                      {metadata.width} x {metadata.height}px
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.actionsTitle}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {actionOrder.map((action) => {
                const Icon = actionIcons[action];
                return (
                  <button
                    key={action}
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-accent-cyan/35 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!metadata || status === "reading" || status === "processing"}
                    onClick={() => applyAction(action)}
                  >
                    <Icon size={16} />
                    {actionLabels[action]}
                  </button>
                );
              })}
            </div>
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600">
              <span className="font-semibold text-ink-800">{labels.transformLabel}:</span>{" "}
              {getTransformSummary(transform, labels)}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="gap-2 justify-self-start"
              onClick={() => {
                setTransform(defaultTransform);
                resetFeedback();
              }}
              disabled={!hasImageTransform(transform) || status === "reading" || status === "processing"}
            >
              <RotateCcw size={16} />
              {labels.resetActions}
            </Button>
          </div>

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
          <h3 className="text-sm font-semibold text-ink-900">{labels.outputTitle}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{labels.outputIntro}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
            {previewUrl ? (
              <img
                alt={labels.previewAlt}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                src={previewUrl}
                style={{ transform: getPreviewTransform(transform) }}
              />
            ) : (
              <div className="text-center text-sm text-ink-500">
                <FileImage className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{labels.noImage}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm">
            <p className="text-ink-500">{t("imageUi.finalDimensions")}</p>
            <p className="mt-1 font-semibold text-ink-900">
              {outputDimensions ? `${outputDimensions.width} x ${outputDimensions.height}px` : "-"}
            </p>
          </div>




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
              {labels.processing}
            </p>
          ) : null}

          {result ? (
            <div className="grid gap-3 rounded-lg border border-accent-teal/25 bg-accent-teal/10 p-3 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{labels.downloadReady}</p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalDimensions")}</dt>
                  <dd className="font-semibold text-ink-900">
                    {result.width} x {result.height}px
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
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {t("imageUi.downloadImage")}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void rotateImage()} disabled={!canRotate}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <RotateCw size={16} />}
              {labels.applyCta}
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
