import { Download, FileArchive, FileImage, Loader2, RotateCcw, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { HelpHint } from "../../../shared/components/HelpHint";
import { cn } from "../../../shared/utils/cn";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { fileProcessingLimitLabels, getGeneratedPageFilesLimitError, getPdfFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  convertPdfPagesToPng,
  createAllPageNumbers,
  defaultOutputBaseName,
  formatFileSize,
  isPdfFile,
  parsePageRange,
  readPdfMetadata,
} from "./pdfToImages.service";
import type { PdfToImagesMetadata, PdfToImagesMode, PdfToImagesProgress, PdfToImagesStatus } from "./pdfToImages.types";

const acceptedPdfTypes = "application/pdf,.pdf";
const inputClassName =
  "min-h-11 rounded-md border border-surface-200 bg-surface-50/75 px-3 text-sm font-normal text-ink-900 outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/15";
const pageRangeHelp =
  "Podés indicar páginas individuales o rangos. Ejemplos: 1,2,3 o 1-3,5,8-10. Los rangos son inclusivos.";

export function PdfToImagesTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfToImagesMetadata | null>(null);
  const [mode, setMode] = useState<PdfToImagesMode>("all-pages");
  const [rangeInput, setRangeInput] = useState("1");
  const [status, setStatus] = useState<PdfToImagesStatus>("idle");
  const [progress, setProgress] = useState<PdfToImagesProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const rangeValidation = useMemo(() => {
    if (!metadata || mode !== "page-range") {
      return null;
    }

    return parsePageRange(rangeInput, metadata.pageCount);
  }, [metadata, mode, rangeInput]);
  const selectedPages =
    metadata && mode === "all-pages"
      ? createAllPageNumbers(metadata.pageCount)
      : rangeValidation?.pages ?? [];
  const imageCount = selectedPages.length;
  const outputExtension = imageCount === 1 ? "png" : "zip";
  const fallbackOutputBaseName = metadata
    ? getSuggestedDownloadBaseName(metadata.fileName, defaultOutputBaseName)
    : defaultOutputBaseName;
  const finalOutputFileName = buildDownloadFileName(outputFileName, outputExtension, fallbackOutputBaseName);
  const outputType = imageCount === 0 ? "Según selección" : imageCount === 1 ? "PNG individual" : "Archivo ZIP";
  const isBusy = status === "reading" || status === "processing";
  const generatedOutputLimitError = imageCount > 0 ? getGeneratedPageFilesLimitError(imageCount, "convertir") : null;
  const canConvert = Boolean(file && metadata) && !isBusy && imageCount > 0 && !rangeValidation?.error && !generatedOutputLimitError;

  const resetFeedback = () => {
    setError(null);
    setLastOutput(null);
    setProgress(null);

    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) {
      return;
    }

    setFile(null);
    setMetadata(null);
    setProgress(null);
    setLastOutput(null);
    setError(null);

    if (!isPdfFile(nextFile)) {
      setStatus("error");
      setError("Seleccioná un archivo PDF válido.");
      return;
    }

    const fileLimitError = getPdfFileSizeLimitError(nextFile);

    if (fileLimitError) {
      setStatus("error");
      setError(fileLimitError);
      return;
    }

    setStatus("reading");

    try {
      const nextMetadata = await readPdfMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSuggestedDownloadBaseName(nextFile.name, defaultOutputBaseName));
      }
      setMode("all-pages");
      setRangeInput(`1-${nextMetadata.pageCount}`);
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo leer el archivo PDF.");
    }
  };

  const clearSelection = () => {
    setFile(null);
    setMetadata(null);
    setMode("all-pages");
    setRangeInput("1");
    setStatus("idle");
    setProgress(null);
    setError(null);
    setIsDragging(false);
    setLastOutput(null);
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResult = (bytes: ArrayBuffer, mimeType: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertPages = async () => {
    if (!file || !canConvert) {
      return;
    }

    setStatus("processing");
    setError(null);
    setLastOutput(null);
    setProgress({ current: 0, total: imageCount });

    try {
      const result = await convertPdfPagesToPng(file, selectedPages, outputFileName, setProgress);
      downloadResult(result.bytes, result.mimeType, result.fileName);
      setLastOutput(
        result.imageCount === 1
          ? `Descargaste ${result.fileName}.`
          : `Descargaste ${result.fileName} con ${result.imageCount} imágenes PNG.`,
      );
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudieron convertir las páginas.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(310px,0.54fr)]">
      <section className="rounded-lg border border-surface-200 bg-surface-50/82 p-4 shadow-panel">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Archivo y configuración</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Seleccioná un PDF y elegí qué páginas querés convertir a imágenes PNG.
            </p>
          </div>

          <button
            className={cn(
              "grid min-h-40 place-items-center rounded-lg border border-dashed p-5 text-center transition",
              isDragging
                ? "border-accent-cyan bg-accent-cyan/10"
                : "border-surface-300 bg-surface-100/70 hover:border-accent-cyan/55 hover:bg-surface-100",
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
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={23} />
              </span>
              <span className="mt-3 block text-base font-semibold text-ink-900">Seleccionar PDF</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">
                También podés arrastrar un archivo aquí. No se sube a servidores.
              </span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{fileProcessingLimitLabels.pdfToImages}</p>

          <input
            ref={fileInputRef}
            accept={acceptedPdfTypes}
            className="hidden"
            type="file"
            onChange={(event) => {
              void processFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {metadata ? (
            <div className="rounded-lg border border-surface-200 bg-surface-100/65 p-3">
              <p className="truncate text-sm font-semibold text-ink-900">{metadata.fileName}</p>
              <p className="mt-1 text-xs text-ink-500">
                {formatFileSize(metadata.fileSize)} · {metadata.pageCount} {metadata.pageCount === 1 ? "página" : "páginas"}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 rounded-lg border border-surface-200 bg-surface-100/65 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Páginas a convertir</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "all-pages"
                    ? "border-accent-cyan/45 bg-accent-cyan/10"
                    : "border-surface-200 bg-surface-50/75 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("all-pages");
                  resetFeedback();
                }}
              >
                <span className="block text-sm font-semibold text-ink-900">Todas las páginas</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">Convierte el PDF completo.</span>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border p-3 text-left transition",
                  mode === "page-range"
                    ? "border-accent-cyan/45 bg-accent-cyan/10"
                    : "border-surface-200 bg-surface-50/75 hover:border-accent-cyan/35",
                )}
                onClick={() => {
                  setMode("page-range");
                  resetFeedback();
                }}
              >
                <span className="block text-sm font-semibold text-ink-900">Elegir páginas</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">Combiná páginas y rangos.</span>
              </button>
            </div>

            {mode === "page-range" ? (
              <div className="grid gap-1.5 text-sm font-semibold text-ink-700">
                <div className="flex items-center gap-2">
                  <label htmlFor="pdf-to-images-range">Páginas a convertir</label>
                  <HelpHint id="pdf-to-images-range-help" text={pageRangeHelp} />
                </div>
                <input
                  id="pdf-to-images-range"
                  className={inputClassName}
                  placeholder="Ej.: 1-3,5,8-10"
                  type="text"
                  value={rangeInput}
                  onChange={(event) => {
                    setRangeInput(event.target.value);
                    resetFeedback();
                  }}
                />
                <span className="text-xs font-normal leading-5 text-ink-500">Usá comas para separar páginas individuales o rangos.</span>
                {rangeValidation?.error ? <span role="alert" className="text-sm font-normal text-ink-700">{rangeValidation.error}</span> : null}
                {!rangeValidation?.error && rangeValidation?.duplicatesRemoved ? (
                  <span className="text-xs font-normal leading-5 text-ink-500">Se quitaron páginas repetidas manteniendo el orden indicado.</span>
                ) : null}
              </div>
            ) : null}
            {generatedOutputLimitError ? <p role="alert" className="text-sm text-ink-700">{generatedOutputLimitError}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-surface-200 bg-surface-50/82 p-4 shadow-panel">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Resultado</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">Cada página se exporta como imagen PNG.</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-surface-200 bg-surface-100/70 p-4">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">Imágenes a generar</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{imageCount}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">{imageCount === 1 ? "imagen PNG" : "imágenes PNG"}</p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-md border border-surface-200 bg-surface-50/70 p-3">
              <dt className="text-ink-500">
                <label htmlFor="pdf-to-images-output-name">Nombre del archivo</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="pdf-to-images-output-name"
                  className={cn(inputClassName, "w-full")}
                  value={outputFileName}
                  placeholder={defaultOutputBaseName}
                  onChange={(event) => {
                    setOutputFileName(event.target.value);
                    setHasCustomOutputFileName(true);
                    resetFeedback();
                  }}
                />
                <span className="mt-2 block break-all text-xs text-ink-500">Se descargará como {finalOutputFileName}</span>
              </dd>
            </div>
            <div className="rounded-md border border-surface-200 bg-surface-50/70 p-3">
              <dt className="text-ink-500">Archivo de descarga</dt>
              <dd className="mt-1 font-semibold text-ink-900">{outputType}</dd>
              <dd className="mt-1 text-xs text-ink-500">Las imágenes internas se generan en PNG.</dd>
            </div>
          </dl>

          {status === "reading" || status === "processing" ? (
            <p
              aria-live="polite"
              role="status"
              className="flex items-center gap-2 rounded-md border border-surface-200 bg-surface-50/75 px-3 py-2 text-sm text-ink-600"
            >
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading"
                ? "Leyendo PDF..."
                : `Procesando página ${progress?.current ?? 0} de ${progress?.total ?? imageCount}...`}
            </p>
          ) : null}

          {status === "success" && lastOutput ? (
            <p aria-live="polite" role="status" className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">{lastOutput}</p>
          ) : null}

          {status === "error" && error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          {!metadata && status === "idle" ? (
            <p className="rounded-md border border-surface-200 bg-surface-50/75 px-3 py-2 text-sm text-ink-600">
              Seleccioná un PDF para habilitar la conversión.
            </p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void convertPages()} disabled={!canConvert}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Convertir a imágenes
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              {imageCount > 1 ? <FileArchive size={16} /> : <FileImage size={16} />}
              Seleccionar PDF
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearSelection}
              disabled={!file && status === "idle" && !hasCustomOutputFileName}
            >
              <RotateCcw size={16} />
              Limpiar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
