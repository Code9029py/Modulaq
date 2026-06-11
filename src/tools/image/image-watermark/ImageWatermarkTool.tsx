import { Download, FileImage, Image as ImageIcon, Loader2, RotateCcw, Stamp, Upload } from "lucide-react";
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
  addImageWatermark,
  buildWatermarkedImageFileName,
  calculateLogoWatermarkDimensions,
  calculateWatermarkPosition,
  defaultOutputBaseName,
  defaultWatermarkColor,
  defaultWatermarkFontSize,
  defaultWatermarkLogoMaxWidthPercent,
  defaultWatermarkMargin,
  defaultWatermarkOpacity,
  defaultWatermarkText,
  formatFileSize,
  getImageFormatLabel,
  getImageMimeLabel,
  getWatermarkedImageOutputBaseName,
  isWatermarkLogoFile,
  normalizeHexColor,
  readImageMetadata,
  validateWatermarkFontSize,
  validateWatermarkLogoMaxWidthPercent,
  validateWatermarkMargin,
  validateWatermarkOpacity,
} from "./imageWatermark.service";
import type {
  ImageWatermarkKind,
  ImageWatermarkMetadata,
  ImageWatermarkOutputFormat,
  ImageWatermarkPosition,
  ImageWatermarkResult,
  ImageWatermarkStatus,
} from "./imageWatermark.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageWatermarkResult & {
  url: string;
};

const baseOutputFormats: ImageWatermarkOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageWatermarkOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const positionOptions: ImageWatermarkPosition[] = [
  "top-left",
  "top-right",
  "center",
  "bottom-left",
  "bottom-right",
];

const copy = {
  es: {
    bottomLeft: "Abajo izquierda",
    bottomRight: "Abajo derecha",
    center: "Centro",
    color: "Color",
    downloadReady: "Imagen con marca lista",
    fontSize: "Tamaño de fuente",
    imageKind: "Imagen/logo",
    logoHelp: "PNG, JPG/JPEG o WebP. Para usar un SVG como logo, convertí primero SVG a PNG.",
    logoInvalid: "Seleccioná un logo PNG, JPG/JPEG o WebP. Para usar un SVG como logo, convertí primero SVG a PNG.",
    logoMaxWidth: "Ancho máximo del logo",
    logoMissing: "Seleccioná una imagen/logo para la marca de agua.",
    addWatermarkCta: "Agregar marca de agua",
    margin: "Margen",
    opacity: "Opacidad",
    outputTitle: "Vista previa y salida",
    previewAlt: "Vista previa de marca de agua",
    previewHelp: "La vista previa aparecerá aquí.",
    previewTitle: "Vista previa",
    processing: "Agregando marca de agua...",
    selectLogo: "Seleccionar logo",
    sourceIntro: "Subí una imagen para aplicar la marca de agua.",
    sourceTitle: "Imagen y marca",
    text: "Texto",
    textHelp: "Configurá texto, posición, color y opacidad.",
    textKind: "Texto",
    topLeft: "Arriba izquierda",
    topRight: "Arriba derecha",
    type: "Tipo de marca",
  },
  en: {
    bottomLeft: "Bottom left",
    bottomRight: "Bottom right",
    center: "Center",
    color: "Color",
    downloadReady: "Watermarked image ready",
    fontSize: "Font size",
    imageKind: "Image/logo",
    logoHelp: "PNG, JPG/JPEG or WebP. To use an SVG logo, convert SVG to PNG first.",
    logoInvalid: "Select a PNG, JPG/JPEG or WebP logo. To use an SVG logo, convert SVG to PNG first.",
    logoMaxWidth: "Logo max width",
    logoMissing: "Select an image/logo watermark.",
    addWatermarkCta: "Add watermark",
    margin: "Margin",
    opacity: "Opacity",
    outputTitle: "Preview and output",
    previewAlt: "Watermark preview",
    previewHelp: "The preview will appear here.",
    previewTitle: "Preview",
    processing: "Adding watermark...",
    selectLogo: "Select logo",
    sourceIntro: "Upload an image to apply the watermark.",
    sourceTitle: "Image and watermark",
    text: "Text",
    textHelp: "Configure text, position, color and opacity.",
    textKind: "Text",
    topLeft: "Top left",
    topRight: "Top right",
    type: "Watermark type",
  },
} as const;

const positionLabelKeys: Record<ImageWatermarkPosition, keyof typeof copy.es> = {
  "top-left": "topLeft",
  "top-right": "topRight",
  center: "center",
  "bottom-left": "bottomLeft",
  "bottom-right": "bottomRight",
};

const watermarkKindOptions: ImageWatermarkKind[] = ["text", "image"];

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function getPreviewTextDimensions(text: string, fontSize: number) {
  return {
    height: fontSize,
    width: Math.max(fontSize, Math.round(text.length * fontSize * 0.58)),
  };
}

function getPreviewWatermarkStyle(
  metadata: ImageWatermarkMetadata,
  text: string,
  fontSize: number,
  position: ImageWatermarkPosition,
  margin: number,
) {
  const textDimensions = getPreviewTextDimensions(text, fontSize);
  const coordinates = calculateWatermarkPosition(metadata, textDimensions, position, margin);

  return {
    fontSize: `${(fontSize / metadata.height) * 100}%`,
    left: `${(coordinates.x / metadata.width) * 100}%`,
    lineHeight: 1,
    top: `${(coordinates.y / metadata.height) * 100}%`,
  };
}

function getPreviewLogoStyle(
  metadata: ImageWatermarkMetadata,
  logoMetadata: ImageWatermarkMetadata,
  logoMaxWidthPercent: number,
  position: ImageWatermarkPosition,
  margin: number,
) {
  const logoDimensions = calculateLogoWatermarkDimensions(metadata, logoMetadata, logoMaxWidthPercent);
  const coordinates = calculateWatermarkPosition(metadata, logoDimensions, position, margin);

  return {
    height: `${(logoDimensions.height / metadata.height) * 100}%`,
    left: `${(coordinates.x / metadata.width) * 100}%`,
    top: `${(coordinates.y / metadata.height) * 100}%`,
    width: `${(logoDimensions.width / metadata.width) * 100}%`,
  };
}

function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

export function ImageWatermarkTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const logoPreviewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageWatermarkMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkKind, setWatermarkKind] = useState<ImageWatermarkKind>("text");
  const [text, setText] = useState(defaultWatermarkText);
  const [fontSizeInput, setFontSizeInput] = useState(String(defaultWatermarkFontSize));
  const [color, setColor] = useState(defaultWatermarkColor);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoMetadata, setLogoMetadata] = useState<ImageWatermarkMetadata | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoMaxWidthPercentInput, setLogoMaxWidthPercentInput] = useState(String(defaultWatermarkLogoMaxWidthPercent));
  const [opacityPercent, setOpacityPercent] = useState(Math.round(defaultWatermarkOpacity * 100));
  const [position, setPosition] = useState<ImageWatermarkPosition>("bottom-right");
  const [marginInput, setMarginInput] = useState(String(defaultWatermarkMargin));
  const [outputFormat, setOutputFormat] = useState<ImageWatermarkOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageWatermarkStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setWebpSupported(canExportBrowserImageFormat("webp"));
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (logoPreviewUrlRef.current) URL.revokeObjectURL(logoPreviewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const outputFormats = useMemo(
    () => (webpSupported ? [...baseOutputFormats, "webp" as const] : baseOutputFormats),
    [webpSupported],
  );
  const fontSize = parseNumberInput(fontSizeInput);
  const margin = parseNumberInput(marginInput);
  const logoMaxWidthPercent = parseNumberInput(logoMaxWidthPercentInput);
  const opacity = opacityPercent / 100;
  const normalizedColor = normalizeHexColor(color);
  const fontSizeError = validateWatermarkFontSize(fontSize);
  const marginError = validateWatermarkMargin(margin);
  const opacityError = validateWatermarkOpacity(opacity);
  const logoMaxWidthError = validateWatermarkLogoMaxWidthPercent(logoMaxWidthPercent);
  const textError = text.trim()
    ? null
    : ({ code: "tools.errors.watermarkEmptyText" } as { code: string; vars?: Record<string, string | number> });
  const sharedWatermarkError = marginError ?? opacityError;
  const watermarkValidationError =
    watermarkKind === "text"
      ? textError ?? fontSizeError ?? sharedWatermarkError
      : logoMaxWidthError ?? sharedWatermarkError;
  const watermarkError =
    watermarkKind === "image" && (!logoFile || !logoMetadata)
      ? { code: "missing" as const, message: labels.logoMissing }
      : watermarkValidationError
        ? { code: "validation" as const, message: t(watermarkValidationError.code as TranslationKey, watermarkValidationError.vars) }
        : null;
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const fallbackBaseName = metadata ? getWatermarkedImageOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = buildWatermarkedImageFileName(outputFileName, outputFormat, fallbackBaseName);
  const canApply = Boolean(file && metadata) && !watermarkError && status !== "reading" && status !== "processing";

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

  const clearLogoSelection = () => {
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
      logoPreviewUrlRef.current = null;
    }
    setLogoFile(null);
    setLogoMetadata(null);
    setLogoPreviewUrl(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
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
      if (!hasCustomOutputFileName) {
        setOutputFileName(getWatermarkedImageOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "imageUi.couldNotRead"));
    }
  };

  const processLogoFile = async (nextLogoFile: File | undefined) => {
    if (!nextLogoFile) return;
    resetFeedback();

    if (isSvgFile(nextLogoFile) || !isWatermarkLogoFile(nextLogoFile)) {
      clearLogoSelection();
      setError(labels.logoInvalid);
      return;
    }

    try {
      const nextLogoMetadata = await readImageMetadata(nextLogoFile);
      if (logoPreviewUrlRef.current) URL.revokeObjectURL(logoPreviewUrlRef.current);
      const nextLogoPreviewUrl = URL.createObjectURL(nextLogoFile);
      logoPreviewUrlRef.current = nextLogoPreviewUrl;
      setLogoFile(nextLogoFile);
      setLogoMetadata(nextLogoMetadata);
      setLogoPreviewUrl(nextLogoPreviewUrl);
      setWatermarkKind("image");
    } catch (nextError) {
      clearLogoSelection();
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.watermarkLogoInvalid"));
    }
  };

  const clearSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    clearResult();
    clearLogoSelection();
    setFile(null);
    setMetadata(null);
    setPreviewUrl(null);
    setWatermarkKind("text");
    setText(defaultWatermarkText);
    setFontSizeInput(String(defaultWatermarkFontSize));
    setColor(defaultWatermarkColor);
    setLogoMaxWidthPercentInput(String(defaultWatermarkLogoMaxWidthPercent));
    setOpacityPercent(Math.round(defaultWatermarkOpacity * 100));
    setPosition("bottom-right");
    setMarginInput(String(defaultWatermarkMargin));
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyWatermark = async () => {
    if (!file || !canApply) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await addImageWatermark(
        file,
        watermarkKind === "image" && logoFile
          ? {
              kind: "image",
              logoFile,
              logoMaxWidthPercent,
              margin,
              opacity,
              outputBaseName: outputFileName,
              outputFormat,
              position,
              quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
            }
          : {
              color: normalizedColor,
              fontSize,
              kind: "text",
              margin,
              opacity,
              outputBaseName: outputFileName,
              outputFormat,
              position,
              quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
              text,
            },
      );
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.watermarkFailed"));
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

          <input
            ref={logoInputRef}
            accept={acceptedImageTypes}
            className="hidden"
            type="file"
            onChange={(event) => {
              void processLogoFile(event.target.files?.[0]);
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
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.type}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {watermarkKindOptions.map((nextKind) => (
                <button
                  key={nextKind}
                  type="button"
                  className={cn(
                    "rounded-md border p-3 text-left transition",
                    watermarkKind === nextKind
                      ? "border-accent-cyan/45 bg-accent-cyan/10"
                      : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                  )}
                  onClick={() => {
                    setWatermarkKind(nextKind);
                    resetFeedback();
                  }}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    {nextKind === "text" ? <Stamp size={16} /> : <ImageIcon size={16} />}
                    {nextKind === "text" ? labels.textKind : labels.imageKind}
                  </span>
                </button>
              ))}
            </div>

            {watermarkKind === "text" ? (
              <div className="grid gap-3">
                <p className="text-xs leading-5 text-ink-500">{labels.textHelp}</p>
                <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                  {labels.text}
                  <input
                    className={inputClassName}
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      resetFeedback();
                    }}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                    {labels.fontSize}
                    <input
                      className={inputClassName}
                      inputMode="numeric"
                      min={8}
                      type="number"
                      value={fontSizeInput}
                      onChange={(event) => {
                        setFontSizeInput(event.target.value);
                        resetFeedback();
                      }}
                    />
                  </label>
                  <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                    {labels.color}
                    <span className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-surface-200/90 bg-surface-50/95 px-2 shadow-sm">
                      <input
                        className="h-8 w-10 shrink-0 rounded border border-surface-200 bg-transparent"
                        type="color"
                        value={normalizedColor}
                        onChange={(event) => {
                          setColor(event.target.value);
                          resetFeedback();
                        }}
                      />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-sm font-normal text-ink-900 outline-none"
                        value={color}
                        onChange={(event) => {
                          setColor(event.target.value);
                          resetFeedback();
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <p className="text-xs leading-5 text-ink-500">{labels.logoHelp}</p>
                <button
                  className="grid min-h-28 place-items-center rounded-lg border border-dashed border-surface-200/80 bg-surface-50/80 p-4 text-center transition hover:border-accent-cyan/55 hover:bg-surface-50"
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <span>
                    <ImageIcon className="mx-auto text-accent-teal" size={26} />
                    <span className="mt-2 block text-sm font-semibold text-ink-900">{labels.selectLogo}</span>
                    <span className="mt-1 block break-all text-xs leading-5 text-ink-500">{logoMetadata?.fileName ?? labels.logoHelp}</span>
                  </span>
                </button>
                <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                  {labels.logoMaxWidth}: {logoMaxWidthPercentInput}%
                  <input
                    className="w-full accent-accent-cyan"
                    min={1}
                    max={100}
                    step={1}
                    type="range"
                    value={logoMaxWidthPercentInput}
                    onChange={(event) => {
                      setLogoMaxWidthPercentInput(event.target.value);
                      resetFeedback();
                    }}
                  />
                </label>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                {labels.margin}
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  min={0}
                  type="number"
                  value={marginInput}
                  onChange={(event) => {
                    setMarginInput(event.target.value);
                    resetFeedback();
                  }}
                />
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                {labels.opacity}: {opacityPercent}%
                <input
                  className="h-11 w-full accent-accent-cyan"
                  min={10}
                  max={100}
                  step={1}
                  type="range"
                  value={opacityPercent}
                  onChange={(event) => {
                    setOpacityPercent(Number(event.target.value));
                    resetFeedback();
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
              {positionOptions.map((nextPosition) => (
                <button
                  key={nextPosition}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-md border px-2 py-2 text-sm font-semibold transition",
                    position === nextPosition
                      ? "border-accent-cyan/45 bg-accent-cyan/10 text-ink-900"
                      : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/35",
                  )}
                  onClick={() => {
                    setPosition(nextPosition);
                    resetFeedback();
                  }}
                >
                  {labels[positionLabelKeys[nextPosition]]}
                </button>
              ))}
            </div>

            {watermarkError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {watermarkError.message}
              </p>
            ) : null}
          </div>

          {status === "reading" || status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "processing" ? labels.processing : t("imageUi.reading")}
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
          <h3 className="text-sm font-semibold text-ink-900">{labels.outputTitle}</h3>        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
            {previewUrl && metadata ? (
              <div
                className="relative w-full max-w-md overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50 shadow-sm"
                style={{ aspectRatio: `${metadata.width} / ${metadata.height}` }}
              >
                <img alt={labels.previewAlt} className="h-full w-full object-fill" src={previewUrl} />
                {watermarkKind === "text" && text.trim() && !textError && !fontSizeError && !marginError ? (
                  <span
                    className="pointer-events-none absolute whitespace-nowrap font-bold leading-none"
                    style={{
                      ...getPreviewWatermarkStyle(metadata, text, fontSize, position, margin),
                      color: normalizedColor,
                      opacity,
                    }}
                  >
                    {text}
                  </span>
                ) : null}
                {watermarkKind === "image" && logoPreviewUrl && logoMetadata && !logoMaxWidthError && !marginError ? (
                  <img
                    alt=""
                    className="pointer-events-none absolute object-contain"
                    src={logoPreviewUrl}
                    style={{
                      ...getPreviewLogoStyle(metadata, logoMetadata, logoMaxWidthPercent, position, margin),
                      opacity,
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <Stamp className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{labels.previewTitle}</p>
                <p className="mt-1 text-xs leading-5 text-ink-500">{labels.previewHelp}</p>
              </div>
            )}
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
          </div>

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
              <span className="text-xs font-normal leading-5 text-ink-500">{t("imageUi.qualityHelp")}</span>
            </label>
          ) : null}

          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
            {t("imageUi.outputName")}
            <input
              className={inputClassName}
              value={outputFileName}
              placeholder={fallbackBaseName}
              onChange={(event) => {
                setOutputFileName(event.target.value);
                setHasCustomOutputFileName(true);
                resetFeedback();
              }}
            />
            <span className="break-all text-xs font-normal leading-5 text-ink-500">{t("imageUi.willPrepareAs", { name: finalOutputFileName })}</span>
          </label>

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
            <Button type="button" className="gap-2" onClick={() => void applyWatermark()} disabled={!canApply}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Stamp size={16} />}
              {labels.addWatermarkCta}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {t("imageUi.selectImage")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearSelection} disabled={!file && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
