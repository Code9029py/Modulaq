import { Download, FileArchive, FileImage, Grid3X3, Loader2, Ruler, RotateCcw, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
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
  buildSplitImageZipFileName,
  calculateImageSplitParts,
  defaultOutputBaseName,
  formatFileSize,
  getImageFormatLabel,
  getImageMimeLabel,
  getSplitImageOutputBaseName,
  readImageMetadata,
  splitImageFile,
  validateImageSplitterOptions,
} from "./imageSplitter.service";
import type {
  ImageSplitPart,
  ImageSplitterMetadata,
  ImageSplitterMode,
  ImageSplitterOptions,
  ImageSplitterOutputFormat,
  ImageSplitterResult,
  ImageSplitterStatus,
} from "./imageSplitter.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type DownloadableResult = ImageSplitterResult & {
  url: string;
};

const baseOutputFormats: ImageSplitterOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageSplitterOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const copy = {
  es: {
    columns: "Columnas",
    downloadReady: "Partes listas",
    fixedHeight: "Alto de cada parte",
    fixedMode: "Tamano fijo",
    fixedWidth: "Ancho de cada parte",
    gridMode: "Filas y columnas",
    jpgTransparency: "JPG no conserva transparencia.",
    modeTitle: "Modo de division",
    outputIntro: "El resultado se descarga como ZIP.",
    outputTitle: "Vista previa y salida",
    partCount: "Partes",
    previewAlt: "Vista previa de la division",
    processing: "Dividiendo imagen...",
    rows: "Filas",
    sourceIntro: "Divide una imagen en varias partes por filas y columnas o por tamano fijo.",
    sourceTitle: "Imagen de origen",
    webpHint: "WebP aparece si tu navegador permite exportarlo correctamente.",
    zipName: "Nombre del ZIP",
  },
  en: {
    columns: "Columns",
    downloadReady: "Parts ready",
    fixedHeight: "Part height",
    fixedMode: "Fixed size",
    fixedWidth: "Part width",
    gridMode: "Rows and columns",
    jpgTransparency: "JPG does not preserve transparency.",
    modeTitle: "Split mode",
    outputIntro: "The result downloads as a ZIP.",
    outputTitle: "Preview and output",
    partCount: "Parts",
    previewAlt: "Split preview",
    processing: "Splitting image...",
    rows: "Rows",
    sourceIntro: "Split one image into multiple parts by rows and columns or by fixed size.",
    sourceTitle: "Source image",
    webpHint: "WebP appears if your browser can export it correctly.",
    zipName: "ZIP name",
  },
} as const;

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function getPartPreviewStyle(part: ImageSplitPart, metadata: ImageSplitterMetadata) {
  return {
    height: `${(part.height / metadata.height) * 100}%`,
    left: `${(part.x / metadata.width) * 100}%`,
    top: `${(part.y / metadata.height) * 100}%`,
    width: `${(part.width / metadata.width) * 100}%`,
  };
}

export function ImageSplitterTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageSplitterMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<ImageSplitterMode>("grid");
  const [rowsInput, setRowsInput] = useState("2");
  const [columnsInput, setColumnsInput] = useState("2");
  const [partWidthInput, setPartWidthInput] = useState("512");
  const [partHeightInput, setPartHeightInput] = useState("512");
  const [outputFormat, setOutputFormat] = useState<ImageSplitterOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageSplitterStatus>("idle");
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
  const splitOptions = useMemo<ImageSplitterOptions>(
    () =>
      mode === "fixed-size"
        ? {
            mode: "fixed-size",
            partHeight: parseNumberInput(partHeightInput),
            partWidth: parseNumberInput(partWidthInput),
          }
        : {
            columns: parseNumberInput(columnsInput),
            mode: "grid",
            rows: parseNumberInput(rowsInput),
          },
    [columnsInput, mode, partHeightInput, partWidthInput, rowsInput],
  );
  const splitError = metadata ? validateImageSplitterOptions(metadata, splitOptions) : null;
  const parts = metadata && !splitError ? calculateImageSplitParts(metadata, splitOptions, outputFormat) : [];
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const fallbackBaseName = metadata ? getSplitImageOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = buildSplitImageZipFileName(outputFileName, fallbackBaseName);
  const canSplit = Boolean(file && metadata) && !splitError && status !== "reading" && status !== "processing";

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
        setOutputFileName(getSplitImageOutputBaseName(nextFile.name));
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
    setMode("grid");
    setRowsInput("2");
    setColumnsInput("2");
    setPartWidthInput("512");
    setPartHeightInput("512");
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const splitImage = async () => {
    if (!file || !canSplit) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await splitImageFile(file, {
        ...splitOptions,
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
      setError(nextError instanceof Error ? nextError.message : "No se pudo dividir la imagen.");
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
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.modeTitle}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "grid" ? "border-accent-cyan/45 bg-accent-cyan/10" : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("grid");
                  resetFeedback();
                }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Grid3X3 size={16} />
                  {labels.gridMode}
                </span>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "fixed-size" ? "border-accent-cyan/45 bg-accent-cyan/10" : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("fixed-size");
                  resetFeedback();
                }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Ruler size={16} />
                  {labels.fixedMode}
                </span>
              </button>
            </div>

            {mode === "grid" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.rows}
                  <input className={inputClassName} inputMode="numeric" min={1} type="number" value={rowsInput} onChange={(event) => { setRowsInput(event.target.value); resetFeedback(); }} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.columns}
                  <input className={inputClassName} inputMode="numeric" min={1} type="number" value={columnsInput} onChange={(event) => { setColumnsInput(event.target.value); resetFeedback(); }} />
                </label>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.fixedWidth}
                  <input className={inputClassName} inputMode="numeric" min={1} type="number" value={partWidthInput} onChange={(event) => { setPartWidthInput(event.target.value); resetFeedback(); }} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.fixedHeight}
                  <input className={inputClassName} inputMode="numeric" min={1} type="number" value={partHeightInput} onChange={(event) => { setPartHeightInput(event.target.value); resetFeedback(); }} />
                </label>
              </div>
            )}

            {splitError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {splitError}
              </p>
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
          <div className="grid min-h-56 place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
            {previewUrl && metadata && parts.length > 0 ? (
              <div
                className="relative w-full max-w-md overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50 shadow-sm"
                style={{ aspectRatio: `${metadata.width} / ${metadata.height}` }}
              >
                <img alt={labels.previewAlt} className="h-full w-full object-fill" src={previewUrl} />
                {parts.map((part) => (
                  <span
                    key={`${part.row}-${part.column}`}
                    className="pointer-events-none absolute border border-accent-cyan/80 bg-accent-cyan/5"
                    style={getPartPreviewStyle(part, metadata)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <FileArchive className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{metadata ? "-" : t("imageUi.selectImage")}</p>
              </div>
            )}
          </div>

          <div className="grid gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm sm:grid-cols-2">
            <div>
              <p className="text-ink-500">{labels.partCount}</p>
              <p className="mt-1 font-semibold text-ink-900">{parts.length || "-"}</p>
            </div>
            <div>
              <p className="text-ink-500">ZIP</p>
              <p className="mt-1 font-semibold text-ink-900">{finalOutputFileName}</p>
            </div>
          </div>

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

          <p className="text-xs leading-5 text-ink-500">{labels.webpHint}</p>

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

          {outputFormat === "jpeg" ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {labels.jpgTransparency}
            </p>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {labels.zipName}
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
                  <dt className="text-ink-500">{labels.partCount}</dt>
                  <dd className="font-semibold text-ink-900">{result.partCount}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(result.size)}</dd>
                </div>
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {language === "en" ? "Download ZIP" : "Descargar ZIP"}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void splitImage()} disabled={!canSplit}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <FileArchive size={16} />}
              {language === "en" ? "Split image" : "Dividir imagen"}
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
