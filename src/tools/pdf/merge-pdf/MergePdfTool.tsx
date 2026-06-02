import { ArrowDown, ArrowUp, Download, FileText, FilePlus2, Loader2, RotateCcw, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";
import { fileProcessingLimitLabels, getPdfFileSizeLimitError, getTotalPdfSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  defaultOutputFileName,
  formatFileSize,
  getBaseFileName,
  isPdfFile,
  mergePdfFiles,
  readPdfMetadata,
  sanitizePdfFileName,
} from "./mergePdf.service";
import type { MergePdfItem, MergePdfStatus } from "./mergePdf.types";

const acceptedPdfTypes = "application/pdf,.pdf";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

function createItemId(file: File) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function getPageLabel(pageCount: number | null, status: MergePdfItem["status"]) {
  if (status === "reading") {
    return "Leyendo páginas...";
  }

  if (status === "error" || pageCount === null) {
    return "Páginas no disponibles";
  }

  return `${pageCount} ${pageCount === 1 ? "página" : "páginas"}`;
}

export function MergePdfTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MergePdfItem[]>([]);
  const [status, setStatus] = useState<MergePdfStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMergedPageCount, setLastMergedPageCount] = useState<number | null>(null);
  const [outputFileName, setOutputFileName] = useState(defaultOutputFileName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const totalSize = useMemo(() => items.reduce((sum, item) => sum + item.size, 0), [items]);
  const sanitizedOutputFileName = useMemo(() => sanitizePdfFileName(outputFileName), [outputFileName]);
  const knownPageCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.pageCount ?? 0), 0),
    [items],
  );
  const hasPendingMetadata = items.some((item) => item.status === "reading");
  const hasUnreadableFiles = items.some((item) => item.status === "error");
  const canMerge = items.length >= 2 && !hasPendingMetadata && !hasUnreadableFiles && status !== "processing";

  const addFiles = (fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length === 0) {
      return;
    }

    const pdfFiles = selectedFiles.filter(isPdfFile);
    const invalidCount = selectedFiles.length - pdfFiles.length;
    const messages: string[] = [];
    const validFiles: File[] = [];
    let nextTotalSize = totalSize;

    if (invalidCount > 0) {
      messages.push(
        invalidCount === 1
          ? "Se omitió un archivo porque no parece ser PDF."
          : `Se omitieron ${invalidCount} archivos porque no parecen ser PDF.`,
      );
    }

    for (const file of pdfFiles) {
      const limitError = getPdfFileSizeLimitError(file) ?? getTotalPdfSizeLimitError(nextTotalSize + file.size);

      if (limitError) {
        messages.push(limitError);
        continue;
      }

      validFiles.push(file);
      nextTotalSize += file.size;
    }

    setWarning(messages.length > 0 ? messages.join(" ") : null);

    if (validFiles.length === 0) {
      setStatus("error");
      setError(messages[0] ?? "Seleccioná uno o varios archivos PDF válidos.");
      return;
    }

    if (items.length === 0 && !hasCustomOutputFileName) {
      setOutputFileName(getBaseFileName(validFiles[0].name) || defaultOutputFileName);
    }

    const nextItems: MergePdfItem[] = validFiles.map((file) => ({
      id: createItemId(file),
      file,
      name: file.name,
      size: file.size,
      pageCount: null,
      status: "reading",
      error: null,
    }));

    setItems((currentItems) => [...currentItems, ...nextItems]);
    setStatus("idle");
    setError(null);
    setLastMergedPageCount(null);

    nextItems.forEach((item) => {
      void readPdfMetadata(item.file)
        .then((metadata) => {
          setItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    pageCount: metadata.pageCount,
                    status: "ready",
                    error: null,
                  }
                : currentItem,
            ),
          );
        })
        .catch((nextError) => {
          setItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    pageCount: null,
                    status: "error",
                    error: nextError instanceof Error ? nextError.message : "No se pudo procesar este PDF.",
                  }
                : currentItem,
            ),
          );
        });
    });
  };

  const moveItem = (itemIndex: number, direction: -1 | 1) => {
    setItems((currentItems) => {
      const targetIndex = itemIndex + direction;

      if (targetIndex < 0 || targetIndex >= currentItems.length) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      [nextItems[itemIndex], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[itemIndex]];
      return nextItems;
    });
    setStatus("idle");
    setError(null);
    setLastMergedPageCount(null);
  };

  const removeItem = (itemId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));

    if (items.length === 1 && items[0].id === itemId) {
      setOutputFileName(defaultOutputFileName);
      setHasCustomOutputFileName(false);
    }

    setStatus("idle");
    setError(null);
    setLastMergedPageCount(null);
  };

  const clearAll = () => {
    setItems([]);
    setStatus("idle");
    setError(null);
    setWarning(null);
    setIsDragging(false);
    setLastMergedPageCount(null);
    setOutputFileName(defaultOutputFileName);
    setHasCustomOutputFileName(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadPdf = (bytes: ArrayBuffer, fileName: string) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(pdfUrl);
  };

  const mergeFiles = async () => {
    if (!canMerge) {
      return;
    }

    setStatus("processing");
    setError(null);
    setWarning(null);
    setLastMergedPageCount(null);

    try {
      const result = await mergePdfFiles(
        items.map((item) => item.file),
        { outputFileName },
      );
      downloadPdf(result.bytes, result.fileName);
      setLastMergedPageCount(result.pageCount);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo unir los PDFs.");
    }
  };

  const pageSummary = hasPendingMetadata
    ? `${knownPageCount}+ páginas detectadas`
    : `${knownPageCount} ${knownPageCount === 1 ? "página" : "páginas"}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(310px,0.5fr)]">
      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Archivos PDF</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Seleccioná varios PDFs y ordenalos antes de generar un único archivo descargable.
            </p>
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
              addFiles(event.dataTransfer.files);
            }}
          >
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={26} />
              </span>
              <span className="mt-4 block text-base font-semibold text-ink-900">Seleccionar PDFs</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">
                Podés cargar dos o más archivos. Todo se procesa en tu navegador.
              </span>
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
              if (event.target.files) {
                addFiles(event.target.files);
              }

              event.target.value = "";
            }}
          />

          {warning ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{warning}</p>
          ) : null}

          {items.length > 0 ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {items.length} {items.length === 1 ? "PDF cargado" : "PDFs cargados"}
                </p>
                <Button type="button" variant="ghost" className="min-h-9 gap-2 px-3" onClick={clearAll}>
                  <RotateCcw size={15} />
                  Limpiar todo
                </Button>
              </div>

              <ul className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
                {items.map((item, itemIndex) => (
                  <li
                    key={item.id}
                    className={cn(
                      "grid gap-3 rounded-xl border bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center xl:grid-cols-[auto_minmax(0,1fr)_auto]",
                      item.status === "error" ? "border-accent-violet/25" : "border-surface-200/80",
                    )}
                  >
                    <span className="w-fit rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-ink-700">
                      #{itemIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{item.name}</p>
                      <p className="mt-1 text-xs text-ink-500">
                        {formatFileSize(item.size)} · {getPageLabel(item.pageCount, item.status)}
                      </p>
                      {item.error ? <p className="mt-2 text-xs leading-5 text-ink-700">{item.error}</p> : null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-2 px-3"
                        onClick={() => moveItem(itemIndex, -1)}
                        disabled={itemIndex === 0}
                      >
                        <ArrowUp size={15} />
                        Subir
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-2 px-3"
                        onClick={() => moveItem(itemIndex, 1)}
                        disabled={itemIndex === items.length - 1}
                      >
                        <ArrowDown size={15} />
                        Bajar
                      </Button>
                      <Button type="button" variant="ghost" className="min-h-9 gap-2 px-3" onClick={() => removeItem(item.id)}>
                        <Trash2 size={15} />
                        Quitar
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
                  <p className="text-sm font-semibold text-ink-900">Sin PDFs todavía</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">
                    Agregá al menos dos archivos para preparar el PDF final.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">PDF final</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">Los archivos se unirán en el orden mostrado.</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">Archivos listos</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{items.length}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">{items.length === 1 ? "PDF" : "PDFs"}</p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Páginas aproximadas</dt>
              <dd className="mt-1 font-semibold text-ink-900">{pageSummary}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Tamaño total</dt>
              <dd className="mt-1 font-semibold text-ink-900">{formatFileSize(totalSize)}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">
                <label htmlFor="merge-pdf-output-name">Nombre de descarga</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="merge-pdf-output-name"
                  className={cn(inputClassName, "w-full")}
                  value={outputFileName}
                  placeholder={defaultOutputFileName}
                  onChange={(event) => {
                    setOutputFileName(event.target.value);
                    setHasCustomOutputFileName(true);
                    setStatus("idle");
                    setError(null);
                    setLastMergedPageCount(null);
                  }}
                />
                <span className="mt-2 block break-all text-xs text-ink-500">Se descargará como {sanitizedOutputFileName}</span>
              </dd>
            </div>
          </dl>

          {hasUnreadableFiles ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              Quitá los PDFs marcados con error para poder unir el resto.
            </p>
          ) : null}

          {items.length === 1 ? (
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              Agregá otro PDF para habilitar la unión.
            </p>
          ) : null}

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              Uniendo PDFs...
            </p>
          ) : null}

          {status === "success" ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">
              PDF generado y descargado{lastMergedPageCount !== null ? ` con ${lastMergedPageCount} páginas.` : "."}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void mergeFiles()} disabled={!canMerge}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Unir PDFs
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <FilePlus2 size={16} />
              Agregar PDFs
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearAll}
              disabled={items.length === 0 && !hasCustomOutputFileName}
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
