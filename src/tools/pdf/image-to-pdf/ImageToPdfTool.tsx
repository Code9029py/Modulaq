import { ArrowDown, ArrowUp, Download, FileImage, ImagePlus, Loader2, RotateCcw, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";
import {
  fileProcessingLimitLabels,
  getImageCountLimitError,
  getImageFileSizeLimitError,
  getTotalImageSizeLimitError,
} from "../../../shared/utils/fileProcessingLimits";
import {
  createPdfFromImages,
  defaultOutputFileName,
  formatFileSize,
  getBaseFileName,
  getSupportedImageType,
  isSupportedImageFile,
  sanitizePdfFileName,
} from "./imageToPdf.service";
import type { ImageToPdfItem, ImageToPdfStatus } from "./imageToPdf.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

function createItemId(file: File) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function getImageTypeLabel(type: ImageToPdfItem["type"]) {
  if (type === "image/jpeg") {
    return "JPG";
  }

  if (type === "image/webp") {
    return "WebP";
  }

  return "PNG";
}

export function ImageToPdfTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [images, setImages] = useState<ImageToPdfItem[]>([]);
  const [status, setStatus] = useState<ImageToPdfStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState(defaultOutputFileName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);

  const totalSize = useMemo(() => images.reduce((sum, image) => sum + image.size, 0), [images]);
  const sanitizedOutputFileName = useMemo(() => sanitizePdfFileName(outputFileName), [outputFileName]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrlsRef.current.clear();
    };
  }, []);

  const createImageItem = (file: File): ImageToPdfItem => {
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);

    return {
      id: createItemId(file),
      file,
      name: file.name,
      previewUrl,
      size: file.size,
      type: getSupportedImageType(file) ?? "image/png",
    };
  };

  const addFiles = (fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length === 0) {
      return;
    }

    const supportedFiles = selectedFiles.filter(isSupportedImageFile);
    const invalidCount = selectedFiles.length - supportedFiles.length;
    const messages: string[] = [];
    const validFiles: File[] = [];
    let nextTotalSize = totalSize;

    if (invalidCount > 0) {
      messages.push(
        invalidCount === 1
          ? "Se omitió un archivo porque no es PNG, JPG o WebP."
          : `Se omitieron ${invalidCount} archivos porque no son PNG, JPG o WebP.`,
      );
    }

    for (const file of supportedFiles) {
      const limitError =
        getImageFileSizeLimitError(file) ??
        getImageCountLimitError(images.length + validFiles.length + 1) ??
        getTotalImageSizeLimitError(nextTotalSize + file.size);

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
      setError(messages[0] ?? "Seleccioná imágenes en formato PNG, JPG o WebP.");
      return;
    }

    if (images.length === 0 && !hasCustomOutputFileName) {
      setOutputFileName(getBaseFileName(validFiles[0].name) || defaultOutputFileName);
    }

    setImages((currentImages) => [...currentImages, ...validFiles.map(createImageItem)]);
    setStatus("idle");
    setError(null);
  };

  const moveImage = (imageIndex: number, direction: -1 | 1) => {
    setImages((currentImages) => {
      const targetIndex = imageIndex + direction;

      if (targetIndex < 0 || targetIndex >= currentImages.length) {
        return currentImages;
      }

      const nextImages = [...currentImages];
      [nextImages[imageIndex], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[imageIndex]];
      return nextImages;
    });
    setStatus("idle");
    setError(null);
  };

  const removeImage = (imageId: string) => {
    setImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        previewUrlsRef.current.delete(imageToRemove.previewUrl);
      }

      return currentImages.filter((image) => image.id !== imageId);
    });
    setStatus("idle");
    setError(null);
  };

  const clearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
      previewUrlsRef.current.delete(image.previewUrl);
    });
    setImages([]);
    setStatus("idle");
    setError(null);
    setWarning(null);
    setIsDragging(false);
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

  const generatePdf = async () => {
    if (images.length === 0 || status === "processing") {
      return;
    }

    setStatus("processing");
    setError(null);
    setWarning(null);

    try {
      const result = await createPdfFromImages(
        images.map((image) => image.file),
        { outputFileName },
      );
      downloadPdf(result.bytes, result.fileName);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "No se pudo generar el PDF.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(310px,0.5fr)]">
      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Imágenes</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Seleccioná una o varias imágenes. Cada archivo se agregará como una página del PDF.
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
              <span className="mt-4 block text-base font-semibold text-ink-900">Seleccionar imágenes</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">
                PNG, JPG/JPEG o WebP. También podés arrastrarlas aquí.
              </span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{fileProcessingLimitLabels.images}</p>

          <input
            ref={fileInputRef}
            accept={acceptedImageTypes}
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

          {images.length > 0 ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {images.length} {images.length === 1 ? "imagen cargada" : "imágenes cargadas"}
                </p>
                <Button type="button" variant="ghost" className="min-h-9 gap-2 px-3" onClick={clearAll}>
                  <RotateCcw size={15} />
                  Limpiar todo
                </Button>
              </div>

              <ul className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
                {images.map((image, imageIndex) => (
                  <li
                    key={image.id}
                    className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[auto_72px_minmax(0,1fr)] sm:items-center xl:grid-cols-[auto_72px_minmax(0,1fr)_auto]"
                  >
                    <span className="w-fit rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-ink-700 sm:justify-self-start">
                      Pág. {imageIndex + 1}
                    </span>
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="h-20 w-full rounded-lg border border-surface-200/80 bg-surface-50 object-cover shadow-sm sm:h-16 sm:w-[72px]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{image.name}</p>
                      <p className="mt-1 text-xs text-ink-500">
                        {getImageTypeLabel(image.type)} · {formatFileSize(image.size)}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-2 px-3"
                        onClick={() => moveImage(imageIndex, -1)}
                        disabled={imageIndex === 0}
                      >
                        <ArrowUp size={15} />
                        Subir
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 gap-2 px-3"
                        onClick={() => moveImage(imageIndex, 1)}
                        disabled={imageIndex === images.length - 1}
                      >
                        <ArrowDown size={15} />
                        Bajar
                      </Button>
                      <Button type="button" variant="ghost" className="min-h-9 gap-2 px-3" onClick={() => removeImage(image.id)}>
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
                  <FileImage size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Sin imágenes todavía</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">
                    Agregá imágenes para preparar un PDF descargable, sin subir archivos a servidores.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">PDF resultante</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">Una página por imagen, centrada y sin deformar.</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-sm font-semibold text-ink-700">Páginas listas</p>
            <p className="mt-2 text-5xl font-semibold text-ink-900">{images.length}</p>
            <p className="mt-2 text-sm font-semibold text-ink-700">{images.length === 1 ? "página" : "páginas"}</p>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">Tamaño total</dt>
              <dd className="mt-1 font-semibold text-ink-900">{formatFileSize(totalSize)}</dd>
            </div>
            <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 shadow-sm">
              <dt className="text-ink-500">
                <label htmlFor="image-to-pdf-output-name">Nombre del archivo</label>
              </dt>
              <dd className="mt-2">
                <input
                  id="image-to-pdf-output-name"
                  className={cn(inputClassName, "w-full")}
                  value={outputFileName}
                  placeholder={defaultOutputFileName}
                  onChange={(event) => {
                    setOutputFileName(event.target.value);
                    setHasCustomOutputFileName(true);
                    setStatus("idle");
                    setError(null);
                  }}
                />
                <span className="mt-2 block break-all text-xs text-ink-500">Se descargará como {sanitizedOutputFileName}</span>
              </dd>
            </div>
          </dl>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              Generando PDF...
            </p>
          ) : null}

          {status === "success" ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">
              PDF generado y descargado.
            </p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void generatePdf()} disabled={images.length === 0 || status === "processing"}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Generar PDF
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={16} />
              Agregar imágenes
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearAll}
              disabled={images.length === 0 && !hasCustomOutputFileName}
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
