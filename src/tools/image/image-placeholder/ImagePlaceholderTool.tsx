import { Download, Image as ImageIcon, Loader2, RotateCcw, Type } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { OutputFormatSelector } from "../shared/OutputFormatSelector";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { cn } from "../../../shared/utils/cn";
import {
  canExportBrowserImageFormat,
  jpegQualityDecimalToPercent,
  jpegQualityPercentToDecimal,
} from "../../../shared/utils/imageFiles";
import {
  buildPlaceholderFileName,
  defaultBackgroundColor,
  defaultPlaceholderHeight,
  defaultPlaceholderWidth,
  defaultTextColor,
  formatFileSize,
  generatePlaceholderImage,
  getDefaultPlaceholderText,
  getImageFormatLabel,
  getPlaceholderOutputBaseName,
  normalizeHexColor,
  validatePlaceholderDimensions,
} from "./imagePlaceholder.service";
import type {
  ImagePlaceholderOutputFormat,
  ImagePlaceholderResult,
  ImagePlaceholderStatus,
} from "./imagePlaceholder.types";

const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImagePlaceholderResult & {
  url: string;
};

const baseOutputFormats: ImagePlaceholderOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImagePlaceholderOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const copy = {
  es: {
    background: "Color de fondo",
    dimensions: "Tamano",
    downloadReady: "Placeholder listo",
    generateCta: "Generar imagen",
    height: "Alto",
    outputTitle: "Vista previa y salida",
    placeholderAlt: "Vista previa del placeholder",
    processing: "Generando placeholder...",
    sourceIntro: "Configurá tamaño, texto y colores.",
    sourceTitle: "Configuracion",
    text: "Texto",
    textColor: "Color de texto",
    textHelp: "Configura tamano, texto y colores.",
    width: "Ancho",
  },
  en: {
    background: "Background color",
    dimensions: "Size",
    downloadReady: "Placeholder ready",
    generateCta: "Generate image",
    height: "Height",
    outputTitle: "Preview and output",
    placeholderAlt: "Placeholder preview",
    processing: "Generating placeholder...",
    sourceIntro: "Configure size, text and colors.",
    sourceTitle: "Settings",
    text: "Text",
    textColor: "Text color",
    textHelp: "Configure size, text and colors.",
    width: "Width",
  },
} as const;

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

export function ImagePlaceholderTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const resultUrlRef = useRef<string | null>(null);
  const [widthInput, setWidthInput] = useState(String(defaultPlaceholderWidth));
  const [heightInput, setHeightInput] = useState(String(defaultPlaceholderHeight));
  const [textInput, setTextInput] = useState(getDefaultPlaceholderText(defaultPlaceholderWidth, defaultPlaceholderHeight));
  const [hasCustomText, setHasCustomText] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
  const [textColor, setTextColor] = useState(defaultTextColor);
  const [outputFormat, setOutputFormat] = useState<ImagePlaceholderOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(getPlaceholderOutputBaseName(defaultPlaceholderWidth, defaultPlaceholderHeight));
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImagePlaceholderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);

  useEffect(() => {
    setWebpSupported(canExportBrowserImageFormat("webp"));
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const width = parseNumberInput(widthInput);
  const height = parseNumberInput(heightInput);
  const normalizedBackgroundColor = normalizeHexColor(backgroundColor, defaultBackgroundColor);
  const normalizedTextColor = normalizeHexColor(textColor, defaultTextColor);
  const dimensionError = validatePlaceholderDimensions(width, height);
  const outputFormats = useMemo(
    () => (webpSupported ? [...baseOutputFormats, "webp" as const] : baseOutputFormats),
    [webpSupported],
  );
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const fallbackBaseName = !dimensionError
    ? getPlaceholderOutputBaseName(width, height)
    : getPlaceholderOutputBaseName(defaultPlaceholderWidth, defaultPlaceholderHeight);
  const finalOutputFileName = buildPlaceholderFileName(outputFileName, outputFormat, fallbackBaseName);
  const canGenerate = !dimensionError && status !== "processing";

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
      setStatus("idle");
    }
  };

  const updateDimensions = (nextWidthInput: string, nextHeightInput: string) => {
    const nextWidth = parseNumberInput(nextWidthInput);
    const nextHeight = parseNumberInput(nextHeightInput);
    if (Number.isInteger(nextWidth) && Number.isInteger(nextHeight) && nextWidth > 0 && nextHeight > 0) {
      if (!hasCustomText) {
        setTextInput(getDefaultPlaceholderText(nextWidth, nextHeight));
      }

      if (!hasCustomOutputFileName) {
        setOutputFileName(getPlaceholderOutputBaseName(nextWidth, nextHeight));
      }
    }
  };

  const clearSettings = () => {
    clearResult();
    setWidthInput(String(defaultPlaceholderWidth));
    setHeightInput(String(defaultPlaceholderHeight));
    setTextInput(getDefaultPlaceholderText(defaultPlaceholderWidth, defaultPlaceholderHeight));
    setHasCustomText(false);
    setBackgroundColor(defaultBackgroundColor);
    setTextColor(defaultTextColor);
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(getPlaceholderOutputBaseName(defaultPlaceholderWidth, defaultPlaceholderHeight));
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
  };

  const generateImage = async () => {
    if (!canGenerate) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await generatePlaceholderImage({
        backgroundColor: normalizedBackgroundColor,
        height,
        outputBaseName: outputFileName,
        outputFormat,
        quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
        text: textInput,
        textColor: normalizedTextColor,
        width,
      });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.placeholderGenerationFailed"));
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.62fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{labels.sourceTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{labels.sourceIntro}</p>
          </div>

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.dimensions}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.width}
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  min={1}
                  type="number"
                  value={widthInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setWidthInput(nextValue);
                    updateDimensions(nextValue, heightInput);
                    resetFeedback();
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.height}
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  min={1}
                  type="number"
                  value={heightInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setHeightInput(nextValue);
                    updateDimensions(widthInput, nextValue);
                    resetFeedback();
                  }}
                />
              </label>
            </div>
            {dimensionError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {t(dimensionError.code as TranslationKey, dimensionError.vars)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.textHelp}</p>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {labels.text}
              <input
                className={inputClassName}
                value={textInput}
                onChange={(event) => {
                  setTextInput(event.target.value);
                  setHasCustomText(true);
                  resetFeedback();
                }}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.background}
                <span className="flex min-h-11 items-center gap-2 rounded-lg border border-surface-200/90 bg-surface-50/95 px-2 shadow-sm">
                  <input
                    className="h-8 w-10 rounded border border-surface-200 bg-transparent"
                    type="color"
                    value={normalizedBackgroundColor}
                    onChange={(event) => {
                      setBackgroundColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-ink-900 outline-none"
                    value={backgroundColor}
                    onChange={(event) => {
                      setBackgroundColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.textColor}
                <span className="flex min-h-11 items-center gap-2 rounded-lg border border-surface-200/90 bg-surface-50/95 px-2 shadow-sm">
                  <input
                    className="h-8 w-10 rounded border border-surface-200 bg-transparent"
                    type="color"
                    value={normalizedTextColor}
                    onChange={(event) => {
                      setTextColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-ink-900 outline-none"
                    value={textColor}
                    onChange={(event) => {
                      setTextColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                </span>
              </label>
            </div>
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

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {labels.processing}
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
            {!dimensionError ? (
              <div
                aria-label={labels.placeholderAlt}
                className="grid w-full max-w-md place-items-center overflow-hidden rounded-lg border border-surface-200/80 px-5 py-4 text-center shadow-sm"
                style={{
                  aspectRatio: `${width} / ${height}`,
                  backgroundColor: normalizedBackgroundColor,
                  color: normalizedTextColor,
                }}
              >
                <span className="max-w-full break-words text-lg font-bold sm:text-2xl">{textInput}</span>
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <ImageIcon className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">-</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm">
            <p className="text-ink-500">{t("imageUi.finalDimensions")}</p>
            <p className="mt-1 font-semibold text-ink-900">{dimensionError ? "-" : `${width} x ${height}px`}</p>
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

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("imageUi.outputName")}
            <input
              className={cn(inputClassName, "w-full")}
              value={outputFileName}
              placeholder={fallbackBaseName}
              onChange={(event) => {
                setOutputFileName(event.target.value);
                setHasCustomOutputFileName(true);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal leading-5 text-ink-500">{t("imageUi.willPrepareAs", { name: finalOutputFileName })}</span>
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
            <Button type="button" className="gap-2" onClick={() => void generateImage()} disabled={!canGenerate}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Type size={16} />}
              {labels.generateCta}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearSettings}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
