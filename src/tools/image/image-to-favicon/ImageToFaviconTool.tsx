import { Download, FileArchive, FileImage, Loader2, Package, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { getImageFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  buildFaviconZipFileName,
  defaultOutputBaseName,
  formatFileSize,
  generateFaviconPack,
  getFaviconIconSpecs,
  getFaviconOutputBaseName,
  getImageMimeLabel,
  readImageMetadata,
} from "./imageToFavicon.service";
import type { ImageToFaviconMetadata, ImageToFaviconResult, ImageToFaviconStatus } from "./imageToFavicon.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";
const iconSpecs = getFaviconIconSpecs();

type DownloadableResult = ImageToFaviconResult & {
  url: string;
};

const copy = {
  es: {
    downloadPack: "Descargar ZIP",
    downloadReady: "Pack de favicon listo",
    outputIntro: "No genera archivo .ico clasico; descarga iconos PNG listos para usar.",
    outputName: "Nombre del ZIP",
    outputTitle: "Pack generado",
    previewAlt: "Vista previa del icono",
    processing: "Generando pack...",
    readmeIncluded: "Incluye README.txt con ejemplos HTML.",
    sourceIntro: "Genera un pack de iconos PNG para favicon, Apple touch icon y PWA.",
    sourceTitle: "Imagen de origen",
    transparencyHint: "Los PNG conservan transparencia cuando la imagen de origen la tiene.",
    webLocal: "Todo se procesa localmente en tu navegador.",
    willPrepareAs: "Se preparara como {{name}}",
    zipContents: "Archivos dentro del ZIP",
  },
  en: {
    downloadPack: "Download ZIP",
    downloadReady: "Favicon pack ready",
    outputIntro: "It does not create a classic .ico file; it downloads ready-to-use PNG icons.",
    outputName: "ZIP name",
    outputTitle: "Generated pack",
    previewAlt: "Icon preview",
    processing: "Generating pack...",
    readmeIncluded: "Includes README.txt with HTML examples.",
    sourceIntro: "Generate a PNG icon pack for favicon, Apple touch icon and PWA.",
    sourceTitle: "Source image",
    transparencyHint: "PNG output preserves transparency when the source image has it.",
    webLocal: "Everything is processed locally in your browser.",
    willPrepareAs: "Will prepare as {{name}}",
    zipContents: "Files inside the ZIP",
  },
} as const;

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replace(`{{${key}}}`, value), template);
}

export function ImageToFaviconTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageToFaviconMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [status, setStatus] = useState<ImageToFaviconStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const finalOutputFileName = buildFaviconZipFileName(
    outputFileName,
    metadata ? getFaviconOutputBaseName(metadata.fileName) : defaultOutputBaseName,
  );
  const canGenerate = Boolean(file && metadata) && status !== "reading" && status !== "processing";

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
        setOutputFileName(getFaviconOutputBaseName(nextFile.name));
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
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generatePack = async () => {
    if (!file || !canGenerate) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await generateFaviconPack(file, { outputBaseName: outputFileName });
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo generar el pack.");
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

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm shadow-sm">
            <p className="leading-6 text-ink-600">{labels.outputIntro}</p>
            <p className="leading-6 text-ink-600">{labels.webLocal}</p>
            <p className="leading-6 text-ink-600">{labels.transparencyHint}</p>
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
          <p className="mt-1 text-xs leading-5 text-ink-500">{labels.readmeIncluded}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid min-h-56 place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-4">
            {previewUrl ? (
              <div className="grid gap-3 text-center">
                <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-[linear-gradient(45deg,#eef2f7_25%,transparent_25%),linear-gradient(-45deg,#eef2f7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eef2f7_75%),linear-gradient(-45deg,transparent_75%,#eef2f7_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] shadow-sm">
                  <img alt={labels.previewAlt} className="h-full w-full object-cover" src={previewUrl} />
                </div>
                <p className="text-xs leading-5 text-ink-500">Cover centrado</p>
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <Package className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{t("imageUi.selectImage")}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.zipContents}</p>
            <ul className="mt-3 grid gap-2 text-sm text-ink-700">
              {iconSpecs.map((icon) => (
                <li key={icon.fileName} className="flex items-center justify-between gap-3 rounded-md border border-surface-200/70 bg-surface-50 px-3 py-2">
                  <span className="min-w-0 truncate">{icon.fileName}</span>
                  <span className="shrink-0 font-semibold text-ink-900">
                    {icon.size} x {icon.size}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 rounded-md border border-surface-200/70 bg-surface-50 px-3 py-2">
                <span className="min-w-0 truncate">README.txt</span>
                <span className="shrink-0 font-semibold text-ink-900">HTML</span>
              </li>
            </ul>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {labels.outputName}
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
            <span className="text-xs font-normal leading-5 text-ink-500">
              {formatTemplate(labels.willPrepareAs, { name: finalOutputFileName })}
            </span>
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
                  <dt className="text-ink-500">ZIP</dt>
                  <dd className="font-semibold text-ink-900">{result.fileName}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{language === "en" ? "Icons" : "Iconos"}</dt>
                  <dd className="font-semibold text-ink-900">{result.iconCount}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(result.size)}</dd>
                </div>
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {labels.downloadPack}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void generatePack()} disabled={!canGenerate}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <FileArchive size={16} />}
              {language === "en" ? "Generate favicon pack" : "Generar pack favicon"}
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
