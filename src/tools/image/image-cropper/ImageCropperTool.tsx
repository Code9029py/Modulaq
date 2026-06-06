import { Crop, Download, FileImage, Loader2, Maximize2, RotateCcw, Scan, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { OutputFormatSelector } from "../shared/OutputFormatSelector";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { getImageFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  canExportBrowserImageFormat,
  jpegQualityDecimalToPercent,
  jpegQualityPercentToDecimal,
} from "../../../shared/utils/imageFiles";
import {
  buildCroppedImageFileName,
  createCenteredCropRect,
  createCenteredSquareCropRect,
  createFullImageCropRect,
  cropImageFile,
  defaultOutputBaseName,
  formatFileSize,
  getCroppedImageOutputBaseName,
  getCropOutputDimensions,
  getImageFormatLabel,
  getImageMimeLabel,
  readImageMetadata,
  validateCropRect,
} from "./imageCropper.service";
import type {
  ImageCropperMetadata,
  ImageCropperOutputFormat,
  ImageCropperResult,
  ImageCropperStatus,
  ImageCropRect,
} from "./imageCropper.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageCropperResult & {
  url: string;
};

const baseOutputFormats: ImageCropperOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageCropperOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const copy = {
  es: {
    centerCrop: "Centrar recorte",
    cropHelp: "X e Y ubican el inicio del recorte; ancho y alto definen su tamano.",
    cropSummary: "Recorte desde (X: {{x}}, Y: {{y}}), tamano {{width}} x {{height}} px",
    cropTitle: "Area de recorte",
    downloadReady: "Imagen recortada lista",
    fullImage: "Imagen completa",
    heightLabel: "Alto del recorte",
    invalidPreview: "Ajusta el recorte para ver la vista previa.",
    outputIntro: "El resultado se genera desde un canvas local.",
    outputTitle: "Vista previa y salida",
    previewAlt: "Vista previa del recorte",
    processing: "Recortando imagen...",
    sourceIntro: "Recorta una imagen definiendo el area exacta.",
    sourceTitle: "Archivo y recorte",
    squareCrop: "Cuadrado centrado",
    widthLabel: "Ancho del recorte",
    webpHint: "WebP aparece si tu navegador permite exportarlo correctamente.",
    xHelp: "X indica cuantos pixeles se avanza desde el borde izquierdo.",
    xLabel: "X / izquierda",
    yHelp: "Y indica cuantos pixeles se baja desde el borde superior.",
    yLabel: "Y / arriba",
  },
  en: {
    centerCrop: "Center crop",
    cropHelp: "X and Y place the crop start; width and height define its size.",
    cropSummary: "Crop from (X: {{x}}, Y: {{y}}), size {{width}} x {{height}} px",
    cropTitle: "Crop area",
    downloadReady: "Cropped image ready",
    fullImage: "Full image",
    heightLabel: "Crop height",
    invalidPreview: "Adjust the crop to see the preview.",
    outputIntro: "The result is generated from a local canvas.",
    outputTitle: "Preview and output",
    previewAlt: "Crop preview",
    processing: "Cropping image...",
    sourceIntro: "Crop an image by defining the exact area.",
    sourceTitle: "File and crop",
    squareCrop: "Centered square",
    widthLabel: "Crop width",
    webpHint: "WebP appears if your browser can export it correctly.",
    xHelp: "X indicates how many pixels to move from the left edge.",
    xLabel: "X / left",
    yHelp: "Y indicates how many pixels to move down from the top edge.",
    yLabel: "Y / top",
  },
} as const;

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replace(`{{${key}}}`, value), template);
}

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function stringifyCropValue(value: number) {
  return String(Math.max(0, Math.round(value)));
}

function getCropPreviewImageStyle(metadata: ImageCropperMetadata, cropRect: ImageCropRect) {
  return {
    maxWidth: "none",
    transform: `translate(-${(cropRect.x / metadata.width) * 100}%, -${(cropRect.y / metadata.height) * 100}%)`,
    width: `${(metadata.width / cropRect.width) * 100}%`,
  };
}

export function ImageCropperTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageCropperMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [xInput, setXInput] = useState("0");
  const [yInput, setYInput] = useState("0");
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<ImageCropperOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageCropperStatus>("idle");
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
  const cropRect = useMemo<ImageCropRect>(
    () => ({
      height: parseNumberInput(heightInput),
      width: parseNumberInput(widthInput),
      x: parseNumberInput(xInput),
      y: parseNumberInput(yInput),
    }),
    [heightInput, widthInput, xInput, yInput],
  );
  const cropError = metadata ? validateCropRect(cropRect, metadata) : null;
  const outputDimensions = metadata && !cropError ? getCropOutputDimensions(cropRect) : null;
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const finalOutputFileName = buildCroppedImageFileName(
    outputFileName,
    outputFormat,
    metadata ? getCroppedImageOutputBaseName(metadata.fileName) : defaultOutputBaseName,
  );
  const canCrop = Boolean(file && metadata) && !cropError && status !== "reading" && status !== "processing";

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

  const applyCropRect = (nextCropRect: ImageCropRect) => {
    setXInput(stringifyCropValue(nextCropRect.x));
    setYInput(stringifyCropValue(nextCropRect.y));
    setWidthInput(stringifyCropValue(nextCropRect.width));
    setHeightInput(stringifyCropValue(nextCropRect.height));
    resetFeedback();
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
      setXInput("0");
      setYInput("0");
      setWidthInput(String(nextMetadata.width));
      setHeightInput(String(nextMetadata.height));
      if (!hasCustomOutputFileName) {
        setOutputFileName(getCroppedImageOutputBaseName(nextFile.name));
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
    setXInput("0");
    setYInput("0");
    setWidthInput("");
    setHeightInput("");
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cropImage = async () => {
    if (!file || !canCrop) return;
    setStatus("processing");
    setError(null);
    clearResult();
    try {
      const nextResult = await cropImageFile(file, {
        cropRect,
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
      setError(nextError instanceof Error ? nextError.message : "No se pudo exportar la imagen.");
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.cropTitle}</p>
              <p className="mt-1 text-xs leading-5 text-ink-500">{labels.cropHelp}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.xLabel}
                <input className={inputClassName} inputMode="numeric" value={xInput} onChange={(event) => { setXInput(event.target.value); resetFeedback(); }} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.yLabel}
                <input className={inputClassName} inputMode="numeric" value={yInput} onChange={(event) => { setYInput(event.target.value); resetFeedback(); }} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.widthLabel}
                <input className={inputClassName} inputMode="numeric" value={widthInput} onChange={(event) => { setWidthInput(event.target.value); resetFeedback(); }} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.heightLabel}
                <input className={inputClassName} inputMode="numeric" value={heightInput} onChange={(event) => { setHeightInput(event.target.value); resetFeedback(); }} />
              </label>
            </div>
            <div className="grid gap-1 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-xs leading-5 text-ink-500">
              <p>{labels.xHelp}</p>
              <p>{labels.yHelp}</p>
              {!cropError && outputDimensions ? (
                <p className="font-semibold text-ink-700">
                  {formatTemplate(labels.cropSummary, {
                    height: String(outputDimensions.height),
                    width: String(outputDimensions.width),
                    x: stringifyCropValue(cropRect.x),
                    y: stringifyCropValue(cropRect.y),
                  })}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={!metadata}
                onClick={() => metadata && applyCropRect(createFullImageCropRect(metadata))}
              >
                <Maximize2 size={16} />
                {labels.fullImage}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={!metadata || Boolean(cropError)}
                onClick={() => metadata && applyCropRect(createCenteredCropRect(metadata, cropRect))}
              >
                <Scan size={16} />
                {labels.centerCrop}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={!metadata}
                onClick={() => metadata && applyCropRect(createCenteredSquareCropRect(metadata))}
              >
                <Crop size={16} />
                {labels.squareCrop}
              </Button>
            </div>
            {cropError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {cropError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <OutputFormatSelector
              description={t(formatDescKeys[outputFormat])}
              formats={outputFormats}
              getLabel={getImageFormatLabel}
              label={language === "en" ? "Output format" : "Formato final"}
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
            {previewUrl && metadata && !cropError ? (
              <div className="w-full max-w-md overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50 shadow-sm" style={{ aspectRatio: `${cropRect.width} / ${cropRect.height}` }}>
                <img
                  alt={labels.previewAlt}
                  className="origin-top-left"
                  src={previewUrl}
                  style={getCropPreviewImageStyle(metadata, cropRect)}
                />
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <FileImage className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{metadata ? labels.invalidPreview : t("imageUi.selectImage")}</p>
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
            <Button type="button" className="gap-2" onClick={() => void cropImage()} disabled={!canCrop}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Crop size={16} />}
              {language === "en" ? "Crop image" : "Recortar imagen"}
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
