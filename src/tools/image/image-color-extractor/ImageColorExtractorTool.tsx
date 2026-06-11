import { Copy, Download, FileImage, Loader2, Palette, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import {
  buildPaletteFileName,
  colorCountOptions,
  defaultColorCount,
  defaultOutputBaseName,
  exportPaletteAsJson,
  exportPaletteAsTxt,
  extractImageColors,
  formatFileSize,
  formatRgb,
  getImageMimeLabel,
  getPaletteOutputBaseName,
  readImageMetadata,
} from "./imageColorExtractor.service";
import type {
  ExtractedImageColor,
  ImageColorExtractorMetadata,
  ImageColorExtractorResult,
  ImageColorExtractorStatus,
} from "./imageColorExtractor.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type PaletteExportFormat = "json" | "txt";
type ColorCountMode = "preset" | "custom";

const customColorCountDefault = 16;
const minCustomColorCount = 1;
const maxCustomColorCount = 24;

const copy = {
  es: {
    analyze: "Extraer colores",
    copied: "Copiado",
    copyHex: "Copiar HEX",
    copyRgb: "Copiar RGB",
    customCount: "Otro",
    customCountError: "Ingresa un numero entre 1 y 24.",
    customCountLabel: "Cantidad personalizada",
    dominantHelp: "Los colores son una estimacion basada en muestreo local.",
    dominantMode: "Colores dominantes",
    downloadJson: "Descargar JSON",
    downloadTxt: "Descargar TXT",
    emptyPalette: "Extrae colores para ver la paleta.",
    foundColors: "Colores encontrados",
    mode: "Modo",
    outputName: "Nombre de la paleta",
    outputTitle: "Resumen y descarga",
    paletteReady: "Paleta lista",
    paletteTitle: "Paleta de colores",
    processing: "Analizando imagen...",
    samplePixels: "Pixeles muestreados",
    sourceIntro: "Subí una imagen para detectar su paleta.",
    sourceTitle: "Imagen de origen",
    swatch: "Muestra de color",
  },
  en: {
    analyze: "Extract colors",
    copied: "Copied",
    copyHex: "Copy HEX",
    copyRgb: "Copy RGB",
    customCount: "Other",
    customCountError: "Enter a number from 1 to 24.",
    customCountLabel: "Custom count",
    dominantHelp: "Colors are an estimate based on local sampling.",
    dominantMode: "Dominant colors",
    downloadJson: "Download JSON",
    downloadTxt: "Download TXT",
    emptyPalette: "Extract colors to see the palette.",
    foundColors: "Colors found",
    mode: "Mode",
    outputName: "Palette name",
    outputTitle: "Summary and download",
    paletteReady: "Palette ready",
    paletteTitle: "Color palette",
    processing: "Analyzing image...",
    samplePixels: "Sampled pixels",
    sourceIntro: "Upload an image to detect its palette.",
    sourceTitle: "Source image",
    swatch: "Color swatch",
  },
} as const;

function downloadTextFile(fileName: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ImageColorExtractorTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageColorExtractorMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colorCount, setColorCount] = useState(defaultColorCount);
  const [colorCountMode, setColorCountMode] = useState<ColorCountMode>("preset");
  const [customColorCountInput, setCustomColorCountInput] = useState(String(customColorCountDefault));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [status, setStatus] = useState<ImageColorExtractorStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageColorExtractorResult | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const fallbackBaseName = metadata ? getPaletteOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const txtFileName = buildPaletteFileName(outputFileName, "txt", fallbackBaseName);
  const jsonFileName = buildPaletteFileName(outputFileName, "json", fallbackBaseName);
  const customColorCountValue = Number(customColorCountInput);
  const customColorCountError =
    colorCountMode === "custom" &&
    (!Number.isInteger(customColorCountValue) ||
      customColorCountValue < minCustomColorCount ||
      customColorCountValue > maxCustomColorCount)
      ? labels.customCountError
      : null;
  const canAnalyze =
    Boolean(file && metadata) && !customColorCountError && status !== "reading" && status !== "processing";
  const colors = result?.colors ?? [];

  const resetFeedback = () => {
    setError(null);
    setCopiedValue(null);
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setStatus("reading");
    setFile(null);
    setMetadata(null);
    setResult(null);
    setError(null);
    setCopiedValue(null);

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
        setOutputFileName(getPaletteOutputBaseName(nextFile.name));
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
    setFile(null);
    setMetadata(null);
    setPreviewUrl(null);
    setColorCount(defaultColorCount);
    setColorCountMode("preset");
    setCustomColorCountInput(String(customColorCountDefault));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setResult(null);
    setStatus("idle");
    setError(null);
    setCopiedValue(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!file || !canAnalyze) return;
    setStatus("processing");
    setError(null);
    setCopiedValue(null);

    try {
      const nextResult = await extractImageColors(file, { colorCount });
      setResult(nextResult);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.colorPaletteFailed"));
    }
  };

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
    } catch {
      setError(t("tools.errors.colorCopyFailed"));
    }
  };

  const downloadPalette = (format: PaletteExportFormat) => {
    if (colors.length === 0) return;

    if (format === "json") {
      downloadTextFile(jsonFileName, exportPaletteAsJson(colors), "application/json");
      return;
    }

    downloadTextFile(txtFileName, exportPaletteAsTxt(colors), "text/plain");
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.58fr)]">
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
            <p className="mt-1 text-xs leading-5 text-ink-500">{labels.dominantHelp}</p>
          </div>

          <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
            <div className="grid gap-3 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.dominantMode}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
                {colorCountOptions.map((nextCount) => (
                  <button
                    key={nextCount}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-semibold transition",
                      colorCountMode === "preset" && colorCount === nextCount
                        ? "border-accent-cyan/45 bg-accent-cyan/10 text-ink-900"
                        : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/35",
                    )}
                    onClick={() => {
                      setColorCountMode("preset");
                      setColorCount(nextCount);
                      setResult(null);
                      resetFeedback();
                    }}
                  >
                    {nextCount}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-semibold transition",
                    colorCountMode === "custom"
                      ? "border-accent-cyan/45 bg-accent-cyan/10 text-ink-900"
                      : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/35",
                  )}
                  onClick={() => {
                    const nextValue =
                      Number.isInteger(customColorCountValue) &&
                      customColorCountValue >= minCustomColorCount &&
                      customColorCountValue <= maxCustomColorCount
                        ? customColorCountValue
                        : customColorCountDefault;
                    setColorCountMode("custom");
                    setCustomColorCountInput(String(nextValue));
                    setColorCount(nextValue);
                    setResult(null);
                    resetFeedback();
                  }}
                >
                  {labels.customCount}
                </button>
              </div>
              {colorCountMode === "custom" ? (
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.customCountLabel}
                  <input
                    className={inputClassName}
                    inputMode="numeric"
                    max={maxCustomColorCount}
                    min={minCustomColorCount}
                    type="number"
                    value={customColorCountInput}
                    onChange={(event) => {
                      const nextInput = event.target.value;
                      const nextValue = Number(nextInput);
                      setCustomColorCountInput(nextInput);
                      if (
                        Number.isInteger(nextValue) &&
                        nextValue >= minCustomColorCount &&
                        nextValue <= maxCustomColorCount
                      ) {
                        setColorCount(nextValue);
                        setResult(null);
                      }
                      resetFeedback();
                    }}
                  />
                  {customColorCountError ? (
                    <span className="text-xs font-normal leading-5 text-accent-violet">{customColorCountError}</span>
                  ) : null}
                </label>
              ) : null}
              <p className="text-xs leading-5 text-ink-500">{labels.dominantHelp}</p>
            </div>

            <div className="grid gap-2">
              <Button type="button" className="gap-2" onClick={() => void analyzeImage()} disabled={!canAnalyze}>
                {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Palette size={16} />}
                {labels.analyze}
              </Button>
              <Button type="button" variant="ghost" className="gap-2" onClick={clearSelection} disabled={!file && status === "idle"}>
                <RotateCcw size={16} />
                {t("toolUi.clear")}
              </Button>
            </div>

            {status === "processing" ? (
              <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
                <Loader2 className="animate-spin text-accent-teal" size={16} />
                {labels.processing}
              </p>
            ) : null}

            <div className="rounded-lg border border-accent-teal/25 bg-accent-teal/10 p-3 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{colors.length > 0 ? labels.paletteReady : labels.emptyPalette}</p>
              <dl className="mt-3 grid gap-2 text-xs text-ink-600">
                <div className="flex items-center justify-between gap-3">
                  <dt>{labels.mode}</dt>
                  <dd className="font-semibold text-ink-900">{labels.dominantMode}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>{labels.samplePixels}</dt>
                  <dd className="font-semibold text-ink-900">{result?.sampledPixels ?? "-"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>{labels.foundColors}</dt>
                  <dd className="font-semibold text-ink-900">{colors.length || "-"}</dd>
                </div>
              </dl>
            </div>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
              {labels.outputName}
              <input
                className={inputClassName}
                value={outputFileName}
                placeholder={defaultOutputBaseName}
                onChange={(event) => {
                  setOutputFileName(event.target.value);
                  setHasCustomOutputFileName(true);
                  resetFeedback();
                }}
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" className="gap-2" onClick={() => downloadPalette("txt")} disabled={colors.length === 0}>
                <Download size={16} />
                {labels.downloadTxt}
              </Button>
              <Button type="button" variant="secondary" className="gap-2" onClick={() => downloadPalette("json")} disabled={colors.length === 0}>
                <Download size={16} />
                {labels.downloadJson}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{labels.paletteTitle}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{labels.dominantHelp}</p>
        </div>

        {colors.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {colors.map((color: ExtractedImageColor) => {
              const rgb = formatRgb(color.rgb);
              return (
                <div key={`${color.hex}-${color.count}`} className="grid min-w-0 gap-3 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
                  <div
                    aria-label={labels.swatch}
                    className="h-16 rounded-lg border border-surface-200/80 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="grid min-w-0 gap-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{color.hex}</p>
                        <p className="break-all text-xs text-ink-500">{rgb}</p>
                      </div>
                      <p className="rounded-md bg-surface-100 px-2 py-1 text-xs font-semibold text-ink-700">
                        {color.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyValue(color.hex)}>
                        <Copy size={15} />
                        {copiedValue === color.hex ? labels.copied : labels.copyHex}
                      </Button>
                      <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyValue(rgb)}>
                        <Copy size={15} />
                        {copiedValue === rgb ? labels.copied : labels.copyRgb}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 grid min-h-48 place-items-center rounded-lg border border-surface-200/80 bg-surface-50/90 p-4 text-center text-sm text-ink-500">
            <span>
              <Palette className="mx-auto text-accent-teal" size={34} />
              <span className="mt-2 block font-semibold text-ink-700">{labels.emptyPalette}</span>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
