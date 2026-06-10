import { Code, Download, FileCode, Image as ImageIcon, Loader2, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { cn } from "../../../shared/utils/cn";
import {
  analyzeSvgSource,
  buildSvgPngFileName,
  convertSvgToPng,
  defaultSvgBackgroundColor,
  defaultSvgPngBaseName,
  formatFileSize,
  getDefaultSvgOutputDimensions,
  getSvgPngOutputBaseName,
  normalizeHexColor,
  readSvgFile,
  validateSvgContent,
  validateSvgOutputDimensions,
} from "./svgToPng.service";
import type { SvgToPngMetadata, SvgToPngResult, SvgToPngStatus } from "./svgToPng.types";

const acceptedSvgTypes = "image/svg+xml,.svg";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = SvgToPngResult & {
  url: string;
};

const copy = {
  es: {
    background: "Color de fondo",
    code: "Codigo SVG",
    convertCta: "Convertir a PNG",
    codePlaceholder: '<svg width="320" height="180" viewBox="0 0 320 180">...</svg>',
    dimensionsHelp: "Podes ajustar tamano y fondo antes de descargar.",
    downloadReady: "PNG listo",
    externalWarning: "Los SVG con recursos externos pueden no renderizarse igual.",
    height: "Alto",
    inputHelp: "Convierte SVG simple a PNG desde tu navegador.",
    invalidFile: "Selecciona un archivo SVG.",
    outputIntro: "Todo se procesa localmente.",
    outputTitle: "Vista previa y salida",
    pasteIntro: "Tambien podes pegar codigo SVG.",
    previewAlt: "Vista previa del SVG",
    processing: "Convirtiendo SVG a PNG...",
    sourceTitle: "SVG de origen",
    transparent: "Fondo transparente",
    type: "Tipo",
    upload: "Seleccionar SVG",
    width: "Ancho",
  },
  en: {
    background: "Background color",
    code: "SVG code",
    convertCta: "Convert to PNG",
    codePlaceholder: '<svg width="320" height="180" viewBox="0 0 320 180">...</svg>',
    dimensionsHelp: "You can adjust size and background before downloading.",
    downloadReady: "PNG ready",
    externalWarning: "SVGs with external resources may not render the same.",
    height: "Height",
    inputHelp: "Convert simple SVG to PNG from your browser.",
    invalidFile: "Select an SVG file.",
    outputIntro: "Everything is processed locally.",
    outputTitle: "Preview and output",
    pasteIntro: "You can also paste SVG code.",
    previewAlt: "SVG preview",
    processing: "Converting SVG to PNG...",
    sourceTitle: "Source SVG",
    transparent: "Transparent background",
    type: "Type",
    upload: "Select SVG",
    width: "Width",
  },
} as const;

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function formatDetectedDimensions(metadata: SvgToPngMetadata) {
  if (metadata.width && metadata.height) {
    return `${metadata.width} x ${metadata.height}px`;
  }

  if (metadata.viewBox) {
    return `viewBox ${metadata.viewBox.width} x ${metadata.viewBox.height}`;
  }

  return "-";
}

export function SvgToPngTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [svgText, setSvgText] = useState("");
  const [metadata, setMetadata] = useState<SvgToPngMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [hasCustomDimensions, setHasCustomDimensions] = useState(false);
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(defaultSvgBackgroundColor);
  const [outputFileName, setOutputFileName] = useState(defaultSvgPngBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [status, setStatus] = useState<SvgToPngStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const width = parseNumberInput(widthInput);
  const height = parseNumberInput(heightInput);
  const normalizedBackgroundColor = normalizeHexColor(backgroundColor);
  const contentError = svgText.trim() ? validateSvgContent(svgText) : null;
  const dimensionError = metadata ? validateSvgOutputDimensions(width, height) : null;
  const finalOutputFileName = buildSvgPngFileName(
    outputFileName,
    metadata ? getSvgPngOutputBaseName(metadata.fileName) : defaultSvgPngBaseName,
  );
  const canConvert = Boolean(svgText.trim() && metadata) && !contentError && !dimensionError && status !== "processing";

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

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  const updatePreview = (content: string) => {
    clearPreview();
    if (validateSvgContent(content)) return;

    const previewUrlObject = URL.createObjectURL(new Blob([content], { type: "image/svg+xml" }));
    previewUrlRef.current = previewUrlObject;
    setPreviewUrl(previewUrlObject);
  };

  const applySvgSource = (content: string, fileName: string | null = null) => {
    setSvgText(content);
    clearResult();
    setError(null);

    if (!content.trim()) {
      setMetadata(null);
      clearPreview();
      setStatus("idle");
      return;
    }

    try {
      const nextMetadata = analyzeSvgSource(content, fileName);
      const nextDimensions = getDefaultSvgOutputDimensions(nextMetadata);
      setMetadata(nextMetadata);
      updatePreview(content);
      if (!hasCustomDimensions) {
        setWidthInput(String(nextDimensions.width));
        setHeightInput(String(nextDimensions.height));
      }
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSvgPngOutputBaseName(fileName));
      }
      setStatus("ready");
    } catch (nextError) {
      setMetadata(null);
      clearPreview();
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.svgReadFailed"));
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setStatus("reading");
    setError(null);
    clearResult();

    if (!nextFile.name.toLowerCase().endsWith(".svg") && nextFile.type !== "image/svg+xml") {
      setStatus("error");
      setError(labels.invalidFile);
      return;
    }

    try {
      const { metadata: nextMetadata, text } = await readSvgFile(nextFile);
      setSvgText(text);
      setMetadata(nextMetadata);
      updatePreview(text);
      const nextDimensions = getDefaultSvgOutputDimensions(nextMetadata);
      if (!hasCustomDimensions) {
        setWidthInput(String(nextDimensions.width));
        setHeightInput(String(nextDimensions.height));
      }
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSvgPngOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setMetadata(null);
      clearPreview();
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.svgReadFailed"));
    }
  };

  const clearSelection = () => {
    clearPreview();
    clearResult();
    setSvgText("");
    setMetadata(null);
    setWidthInput("");
    setHeightInput("");
    setHasCustomDimensions(false);
    setTransparentBackground(true);
    setBackgroundColor(defaultSvgBackgroundColor);
    setOutputFileName(defaultSvgPngBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const convertToPng = async () => {
    if (!canConvert) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await convertSvgToPng(svgText, {
        backgroundColor: normalizedBackgroundColor,
        height,
        outputBaseName: outputFileName,
        transparentBackground,
        width,
      });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.svgConversionFailed"));
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(310px,0.54fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{labels.sourceTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{labels.inputHelp}</p>
          </div>

          <button
            className={cn(
              "grid min-h-44 place-items-center rounded-lg border border-dashed p-5 text-center transition",
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
              <span className="mt-4 block text-base font-semibold text-ink-900">{labels.upload}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">.svg / image/svg+xml</span>
            </span>
          </button>

          <input
            ref={fileInputRef}
            accept={acceptedSvgTypes}
            className="hidden"
            type="file"
            onChange={(event) => {
              void processFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {labels.code}
            <textarea
              className={cn(inputClassName, "min-h-44 resize-y py-3 font-mono text-xs leading-5")}
              placeholder={labels.codePlaceholder}
              spellCheck={false}
              value={svgText}
              onChange={(event) => applySvgSource(event.target.value, null)}
            />
            <span className="text-xs font-normal leading-5 text-ink-500">{labels.pasteIntro}</span>
          </label>

          {metadata ? (
            <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[96px_minmax(0,1fr)]">
              <span className="grid h-24 w-full place-items-center rounded-lg border border-surface-200/80 bg-surface-50 text-accent-teal shadow-sm sm:w-24">
                <FileCode size={28} />
              </span>
              <dl className="grid min-w-0 gap-2 text-sm">
                <div>
                  <dt className="text-ink-500">{t("imageUi.fileName")}</dt>
                  <dd className="truncate font-semibold text-ink-900">{metadata.fileName ?? defaultSvgPngBaseName}</dd>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-ink-500">{labels.type}</dt>
                    <dd className="font-semibold text-ink-900">SVG</dd>
                  </div>
                  <div>
                    <dt className="text-ink-500">{t("imageUi.originalSize")}</dt>
                    <dd className="font-semibold text-ink-900">{formatFileSize(metadata.sourceSize)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-500">{t("imageUi.dimensions")}</dt>
                    <dd className="font-semibold text-ink-900">{formatDetectedDimensions(metadata)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          ) : null}

          {metadata?.hasExternalResources ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {labels.externalWarning}
            </p>
          ) : null}

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.dimensionsHelp}</p>
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
                    setWidthInput(event.target.value);
                    setHasCustomDimensions(true);
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
                    setHeightInput(event.target.value);
                    setHasCustomDimensions(true);
                    resetFeedback();
                  }}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <input
                checked={transparentBackground}
                className="h-4 w-4 accent-accent-cyan"
                type="checkbox"
                onChange={(event) => {
                  setTransparentBackground(event.target.checked);
                  resetFeedback();
                }}
              />
              {labels.transparent}
            </label>

            {!transparentBackground ? (
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
            ) : null}

            {dimensionError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {t(dimensionError.code as TranslationKey, dimensionError.vars)}
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
          <h3 className="text-sm font-semibold text-ink-900">{labels.outputTitle}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{labels.outputIntro}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid min-h-56 place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
            {previewUrl && metadata && !dimensionError ? (
              <div
                className="grid w-full max-w-md place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-[length:18px_18px] shadow-sm"
                style={{
                  aspectRatio: `${width} / ${height}`,
                  backgroundColor: transparentBackground ? undefined : normalizedBackgroundColor,
                  backgroundImage: transparentBackground
                    ? "linear-gradient(45deg, rgba(15,23,42,.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(15,23,42,.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(15,23,42,.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(15,23,42,.08) 75%)"
                    : undefined,
                  backgroundPosition: transparentBackground ? "0 0, 0 9px, 9px -9px, -9px 0px" : undefined,
                }}
              >
                <img alt={labels.previewAlt} className="h-full w-full object-fill" src={previewUrl} />
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <ImageIcon className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{labels.upload}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm">
            <p className="text-ink-500">{t("imageUi.finalFormat")}</p>
            <p className="mt-1 font-semibold text-ink-900">PNG</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("imageUi.outputName")}
            <input
              className={cn(inputClassName, "w-full")}
              value={outputFileName}
              placeholder={metadata ? getSvgPngOutputBaseName(metadata.fileName) : defaultSvgPngBaseName}
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
                  <dd className="font-semibold text-ink-900">PNG</dd>
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
            <Button type="button" className="gap-2" onClick={() => void convertToPng()} disabled={!canConvert}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Code size={16} />}
              {labels.convertCta}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {labels.upload}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearSelection} disabled={!svgText && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
