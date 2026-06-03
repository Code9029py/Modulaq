import { Download, FileArchive, FileText, Loader2, Minimize2, RotateCcw, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";
import { fileProcessingLimitLabels, getPdfFileSizeLimitError, getTotalPdfSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  compressPdf,
  createCompressedDownload,
  defaultOutputBaseName,
  formatFileSize,
  formatSizeDifference,
  getDownloadFileName,
  getSuggestedOutputBaseName,
  isPdfFile,
  readPdfMetadata,
} from "./compressPdf.service";
import type {
  CompressPdfDownload,
  CompressPdfItemStatus,
  CompressPdfMetadata,
  CompressPdfResult,
  CompressPdfStatus,
} from "./compressPdf.types";

const acceptedPdfTypes = "application/pdf,.pdf";

type CompressionItem = {
  error: string | null;
  file: File;
  id: string;
  metadata: CompressPdfMetadata;
  result: CompressPdfResult | null;
  status: CompressPdfItemStatus;
};

function createItem(file: File, metadata: CompressPdfMetadata): CompressionItem {
  return {
    error: null,
    file,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    metadata,
    result: null,
    status: "ready",
  };
}

function resetItemResult(item: CompressionItem): CompressionItem {
  return {
    ...item,
    error: null,
    result: null,
    status: "ready",
  };
}

export function CompressPdfTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<CompressionItem[]>([]);
  const [download, setDownload] = useState<CompressPdfDownload | null>(null);
  const [status, setStatus] = useState<CompressPdfStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const isBusy = status === "reading" || status === "processing";
  const results = items.flatMap((item) => (item.result ? [item.result] : []));
  const originalTotal = items.reduce((total, item) => total + item.metadata.fileSize, 0);
  const outputTotal = results.length === items.length && items.length > 0
    ? results.reduce((total, result) => total + result.outputSize, 0)
    : null;
  const savedTotal = outputTotal === null ? null : originalTotal - outputTotal;
  const totalReductionPercentage = savedTotal === null || originalTotal === 0 ? null : (savedTotal / originalTotal) * 100;
  const reducedCount = results.filter((result) => result.hasSignificantReduction).length;
  const noSignificantReductionCount = results.filter((result) => !result.hasSignificantReduction).length;
  const canCompress = items.length > 0 && !isBusy;
  const canDownload = Boolean(download) && !isBusy;
  const fallbackOutputBaseName =
    items.length > 0 ? getSuggestedOutputBaseName(items[0].metadata.fileName) : defaultOutputBaseName;
  const outputUsesZip = download ? download.mimeType === "application/zip" : items.length > 1;
  const expectedOutputName = download?.fileName ?? getDownloadFileName(outputFileName, outputUsesZip, fallbackOutputBaseName);

  const processFiles = async (nextFiles: File[]) => {
    if (nextFiles.length === 0 || isBusy) {
      return;
    }

    const pdfFiles = nextFiles.filter(isPdfFile);
    const rejectedCount = nextFiles.length - pdfFiles.length;
    const nextItems: CompressionItem[] = [];
    const readErrors: string[] = [];
    let acceptedTotalSize = items.reduce((total, item) => total + item.metadata.fileSize, 0);

    setItems((currentItems) => currentItems.map(resetItemResult));
    setDownload(null);
    setError(null);
    setStatus("reading");

    for (const nextFile of pdfFiles) {
      const fileLimitError = getPdfFileSizeLimitError(nextFile);
      const totalLimitError = getTotalPdfSizeLimitError(acceptedTotalSize + nextFile.size);

      if (fileLimitError || totalLimitError) {
        readErrors.push(`${nextFile.name}: ${fileLimitError ?? totalLimitError}`);
        continue;
      }

      try {
        const nextItem = createItem(nextFile, await readPdfMetadata(nextFile));
        nextItems.push(nextItem);
        acceptedTotalSize += nextItem.metadata.fileSize;
      } catch (nextError) {
        readErrors.push(
          `${nextFile.name}: ${nextError instanceof Error ? nextError.message : "No se pudo leer este PDF."}`,
        );
      }
    }

    setItems((currentItems) => [...currentItems, ...nextItems]);
    if (items.length === 0 && nextItems.length > 0 && !hasCustomOutputFileName) {
      setOutputFileName(getSuggestedOutputBaseName(nextItems[0].metadata.fileName));
    }

    const messages: string[] = [];

    if (rejectedCount > 0) {
      messages.push(rejectedCount === 1 ? "Se omitió un archivo que no es PDF." : `Se omitieron ${rejectedCount} archivos que no son PDF.`);
    }

    messages.push(...readErrors);
    setError(messages.length > 0 ? messages.join(" ") : null);
    setStatus(items.length + nextItems.length > 0 ? "ready" : "error");
  };

  const removeItem = (id: string) => {
    const remainingItems = items.filter((item) => item.id !== id).map(resetItemResult);
    setItems(remainingItems);
    setDownload(null);
    setError(null);
    setStatus(remainingItems.length > 0 ? "ready" : "idle");
  };

  const clearSelection = () => {
    setItems([]);
    setDownload(null);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const optimizePdfs = async () => {
    if (!canCompress) {
      return;
    }

    const nextResults: CompressPdfResult[] = [];
    const processErrors: string[] = [];

    setDownload(null);
    setError(null);
    setStatus("processing");
    setItems((currentItems) => currentItems.map((item) => ({ ...item, error: null, result: null, status: "ready" })));

    for (const item of items) {
      setItems((currentItems) =>
        currentItems.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, status: "processing" } : currentItem)),
      );

      try {
        const result = await compressPdf(item.file);
        nextResults.push(result);
        setItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id ? { ...currentItem, result, status: "success" } : currentItem,
          ),
        );
      } catch (nextError) {
        const message = nextError instanceof Error ? nextError.message : "No se pudo optimizar este PDF.";
        processErrors.push(`${item.metadata.fileName}: ${message}`);
        setItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id ? { ...currentItem, error: message, status: "error" } : currentItem,
          ),
        );
      }
    }

    if (nextResults.length === 0) {
      setError(processErrors.join(" ") || "No se pudo procesar ningún PDF.");
      setStatus("error");
      return;
    }

    try {
      setDownload(await createCompressedDownload(nextResults, outputFileName, nextResults.length > 1, fallbackOutputBaseName));
      setError(processErrors.length > 0 ? processErrors.join(" ") : null);
      setStatus("success");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo preparar la descarga.");
      setStatus("error");
    }
  };

  const downloadResult = () => {
    if (!download) {
      return;
    }

    const url = URL.createObjectURL(new Blob([download.bytes], { type: download.mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = download.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(310px,0.52fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Archivos PDF</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Seleccioná uno o varios documentos para intentar optimizar su tamaño localmente.
            </p>
          </div>

          <p className="rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-3 py-2 text-sm leading-6 text-ink-700">
            La compresión desde navegador puede variar según el contenido del PDF. Algunos archivos ya vienen optimizados o incluyen
            imágenes comprimidas, por lo que pueden reducirse poco o nada.
          </p>

          <button
            className={cn(
              "grid min-h-40 place-items-center rounded-lg border border-dashed p-5 text-center transition",
              isDragging
                ? "border-accent-cyan bg-accent-cyan/10"
                : "border-surface-200/80 bg-surface-50/80 hover:border-accent-cyan/55 hover:bg-surface-50",
              isBusy && "cursor-not-allowed opacity-65",
            )}
            disabled={isBusy}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isBusy) {
                setIsDragging(true);
              }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void processFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <span>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={23} />
              </span>
              <span className="mt-3 block text-base font-semibold text-ink-900">Seleccionar PDFs</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">También podés arrastrar varios archivos aquí.</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{fileProcessingLimitLabels.pdfMultiple}</p>

          <input
            ref={fileInputRef}
            accept={acceptedPdfTypes}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => {
              void processFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />

          {items.length > 0 ? (
            <ul className="grid max-h-[29rem] gap-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{item.metadata.fileName}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-500">
                      {formatFileSize(item.metadata.fileSize)} · {item.metadata.pageCount}{" "}
                      {item.metadata.pageCount === 1 ? "página" : "páginas"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-700">
                      {item.status === "ready" ? "Listo para comprimir" : null}
                      {item.status === "processing" ? "Optimizando..." : null}
                      {item.status === "success" && item.result?.hasSignificantReduction
                        ? `${formatSizeDifference(item.result.savedBytes)} (${item.result.reductionPercentage.toFixed(1)}%)`
                        : null}
                      {item.status === "success" && !item.result?.hasSignificantReduction
                        ? "Sin reducción significativa. Puede que ya esté optimizado o contenga imágenes comprimidas."
                        : null}
                      {item.status === "error" ? item.error : null}
                    </p>
                    {item.result ? <p className="mt-1 text-xs text-ink-500">Resultado: {formatFileSize(item.result.outputSize)}</p> : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 gap-2 px-3"
                    onClick={() => removeItem(item.id)}
                    disabled={isBusy}
                  >
                    <Trash2 size={15} />
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-surface-200 bg-surface-50 text-accent-teal">
                <FileText size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Sin PDFs seleccionados</p>
                <p className="mt-1 text-sm leading-6 text-ink-500">Cargá archivos para consultar tamaños y procesarlos.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Resultado</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">
            {outputUsesZip ? "Los resultados se descargarán en un archivo ZIP." : "El resultado se descargará como PDF."}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">Archivos cargados</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{items.length}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">{items.length === 1 ? "PDF" : "PDFs"}</p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Antes</dt>
              <dd className="mt-1 font-semibold text-ink-900">{items.length > 0 ? formatFileSize(originalTotal) : "--"}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Después</dt>
              <dd className="mt-1 font-semibold text-ink-900">{outputTotal === null ? "--" : formatFileSize(outputTotal)}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Diferencia total</dt>
              <dd className="mt-1 font-semibold text-ink-900">{savedTotal === null ? "--" : formatSizeDifference(savedTotal)}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Reducción total</dt>
              <dd className="mt-1 font-semibold text-ink-900">
                {totalReductionPercentage === null ? "--" : `${totalReductionPercentage.toFixed(1)}%`}
              </dd>
            </div>
          </dl>

          <label className="grid gap-1.5 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm font-semibold text-ink-700 shadow-sm">
            Nombre del archivo
            <input
              className="min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
              value={outputFileName}
              placeholder={defaultOutputBaseName}
              onChange={(event) => {
                setOutputFileName(event.target.value);
                setHasCustomOutputFileName(true);
                setDownload(null);
              }}
            />
            <span className="break-all text-xs font-normal leading-5 text-ink-500">Se descargará como {expectedOutputName}</span>
          </label>

          {status === "reading" || status === "processing" ? (
            <p
              aria-live="polite"
              role="status"
              className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm"
            >
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading" ? "Leyendo PDFs..." : "Optimizando PDFs..."}
            </p>
          ) : null}

          {status === "success" ? (
            <p aria-live="polite" role="status" className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm leading-6 text-ink-700">
              Procesados: {results.length}. Reducciones logradas: {reducedCount}. Sin reducción significativa: {noSignificantReductionCount}.
              {noSignificantReductionCount > 0 ? " Es posible que esos PDFs ya estuvieran optimizados o incluyan imágenes comprimidas." : ""}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm leading-6 text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void optimizePdfs()} disabled={!canCompress}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Minimize2 size={16} />}
              {items.length > 1 ? "Comprimir PDFs" : "Comprimir PDF"}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult} disabled={!canDownload}>
              {outputUsesZip ? <FileArchive size={16} /> : <Download size={16} />}
              Descargar resultado
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearSelection}
              disabled={(items.length === 0 && !hasCustomOutputFileName) || isBusy}
            >
              <RotateCcw size={16} />
              Limpiar todo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
