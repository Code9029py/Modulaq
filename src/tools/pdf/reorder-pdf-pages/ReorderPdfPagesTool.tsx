import { ArrowDown, ArrowUp, Download, FileText, Loader2, RotateCcw, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";
import { fileProcessingLimitLabels, getPdfFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  createOriginalPageOrder,
  defaultOutputBaseName,
  formatFileSize,
  getOutputFileName,
  getSuggestedOutputBaseName,
  isOriginalPageOrder,
  isPdfFile,
  readPdfMetadata,
  reorderPdfPages,
} from "./reorderPdfPages.service";
import type { ReorderPdfPagesMetadata, ReorderPdfPagesStatus } from "./reorderPdfPages.types";

const acceptedPdfTypes = "application/pdf,.pdf";

export function ReorderPdfPagesTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ReorderPdfPagesMetadata | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [status, setStatus] = useState<ReorderPdfPagesStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const isBusy = status === "reading" || status === "processing";
  const hasOriginalOrder = isOriginalPageOrder(pageOrder);
  const canDownload = Boolean(file && metadata) && !isBusy;
  const fallbackOutputBaseName = metadata ? getSuggestedOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = getOutputFileName(outputFileName, fallbackOutputBaseName);

  const resetFeedback = () => {
    setError(null);
    setLastOutput(null);

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
    setPageOrder([]);
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
      setPageOrder(createOriginalPageOrder(nextMetadata.pageCount));
      if (!hasCustomOutputFileName) {
        setOutputFileName(getSuggestedOutputBaseName(nextFile.name));
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo leer el archivo PDF.");
    }
  };

  const movePage = (position: number, direction: -1 | 1) => {
    setPageOrder((currentPageOrder) => {
      const targetPosition = position + direction;

      if (targetPosition < 0 || targetPosition >= currentPageOrder.length) {
        return currentPageOrder;
      }

      const nextPageOrder = [...currentPageOrder];
      [nextPageOrder[position], nextPageOrder[targetPosition]] = [
        nextPageOrder[targetPosition],
        nextPageOrder[position],
      ];
      return nextPageOrder;
    });
    resetFeedback();
  };

  const restoreOriginalOrder = () => {
    if (!metadata) {
      return;
    }

    setPageOrder(createOriginalPageOrder(metadata.pageCount));
    resetFeedback();
  };

  const clearSelection = () => {
    setFile(null);
    setMetadata(null);
    setPageOrder([]);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    setLastOutput(null);
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResult = (bytes: ArrayBuffer, fileName: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePdf = async () => {
    if (!file || !canDownload) {
      return;
    }

    setStatus("processing");
    setError(null);
    setLastOutput(null);

    try {
      const result = await reorderPdfPages(file, pageOrder, outputFileName);
      downloadResult(result.bytes, result.fileName);
      setLastOutput(`Descargaste ${result.fileName} con ${result.pageCount} ${result.pageCount === 1 ? "página" : "páginas"}.`);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo generar el PDF reordenado.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.96fr)_minmax(310px,0.52fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Archivo y páginas</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Seleccioná un PDF y mové sus páginas con los controles de subir y bajar.
            </p>
          </div>

          <button
            className={cn(
              "grid min-h-40 place-items-center rounded-lg border border-dashed p-5 text-center transition",
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
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={23} />
              </span>
              <span className="mt-3 block text-base font-semibold text-ink-900">Seleccionar PDF</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">
                También podés arrastrar un archivo aquí. No se sube a servidores.
              </span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{fileProcessingLimitLabels.pdfSingle}</p>

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
            <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <p className="truncate text-sm font-semibold text-ink-900">{metadata.fileName}</p>
              <p className="mt-1 text-xs text-ink-500">
                {formatFileSize(metadata.fileSize)} · {metadata.pageCount} {metadata.pageCount === 1 ? "página" : "páginas"}
              </p>
            </div>
          ) : null}

          {metadata ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Orden de páginas</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-9 gap-2 px-3"
                  onClick={restoreOriginalOrder}
                  disabled={hasOriginalOrder}
                >
                  <RotateCcw size={15} />
                  Restablecer orden
                </Button>
              </div>

              <ul className="grid max-h-[26rem] gap-2 overflow-y-auto pr-1">
                {pageOrder.map((pageNumber, position) => (
                  <li
                    key={pageNumber}
                    className="grid gap-2 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-ink-700">
                      #{position + 1}
                    </span>
                    <p className="text-sm font-semibold text-ink-900">Página {pageNumber}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-1 px-2 sm:px-3"
                        onClick={() => movePage(position, -1)}
                        disabled={position === 0}
                      >
                        <ArrowUp size={15} />
                        Subir
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-1 px-2 sm:px-3"
                        onClick={() => movePage(position, 1)}
                        disabled={position === pageOrder.length - 1}
                      >
                        <ArrowDown size={15} />
                        Bajar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-surface-200 bg-surface-50 text-accent-teal">
                  <FileText size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Sin PDF seleccionado</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">
                    Cargá un archivo para ver su lista de páginas y cambiar el orden.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Resultado</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">El PDF se genera localmente con el orden visible en la lista.</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">Páginas detectadas</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{metadata?.pageCount ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">{metadata?.pageCount === 1 ? "página" : "páginas"}</p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Orden actual</dt>
              <dd className="mt-1 font-semibold text-ink-900">{hasOriginalOrder ? "Orden original" : "Orden modificado"}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">
                <label htmlFor="reorder-pdf-output-name">Nombre del archivo</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="reorder-pdf-output-name"
                  className="min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
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
          </dl>

          {status === "reading" || status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {status === "reading" ? "Leyendo PDF..." : "Generando PDF reordenado..."}
            </p>
          ) : null}

          {status === "success" && lastOutput ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">{lastOutput}</p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          {!metadata && status === "idle" ? (
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              Seleccioná un PDF para habilitar la descarga.
            </p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void generatePdf()} disabled={!canDownload}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Descargar PDF reordenado
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={restoreOriginalOrder} disabled={!metadata || hasOriginalOrder}>
              <RotateCcw size={16} />
              Restablecer orden
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearSelection}
              disabled={!file && status === "idle" && !hasCustomOutputFileName}
            >
              <Trash2 size={16} />
              Limpiar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
