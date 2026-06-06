import { Clipboard, Download, Loader2, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { getImageFileSizeLimitError } from "../../../shared/utils/fileProcessingLimits";
import {
  buildBase64TextFileName,
  defaultTextOutputBaseName,
  fileToBase64,
  formatFileSize,
  getMimeLabel,
} from "./imageBase64.service";
import type { ImageBase64CopyTarget, ImageBase64Metadata, ImageBase64Status } from "./imageBase64.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";
const textareaClassName = cn(inputClassName, "min-h-56 resize-y py-3 font-mono text-xs leading-5");

export function ImageToBase64Tool() {
  const { language, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<ImageBase64Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageBase64Metadata | null>(null);
  const [textOutputBaseName, setTextOutputBaseName] = useState(defaultTextOutputBaseName);
  const [copiedTarget, setCopiedTarget] = useState<ImageBase64CopyTarget | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const intro =
    language === "en"
      ? "Convert an image into Base64 text or a Data URL."
      : "Convierte una imagen en texto Base64 o Data URL.";
  const localNote =
    language === "en"
      ? "Everything is processed locally in your browser."
      : "Todo se procesa localmente en tu navegador.";

  const getCopyLabel = (target: ImageBase64CopyTarget) => {
    if (target === copiedTarget) return t("toolUi.copied");
    return target === "base64"
      ? t("tools.image-base64.ui.copyBase64")
      : t("tools.image-base64.ui.copyDataUrl");
  };

  const resetFeedback = () => {
    setError(null);
    setCopiedTarget(null);
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  };

  const processFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus("reading");
    setError(null);
    setImageMetadata(null);
    setCopiedTarget(null);

    const fileLimitError = getImageFileSizeLimitError(file);
    if (fileLimitError) {
      setStatus("error");
      setError(fileLimitError);
      return;
    }

    try {
      const nextMetadata = await fileToBase64(file);
      setImageMetadata(nextMetadata);
      setTextOutputBaseName(nextMetadata.fileName.replace(/\.[^.]+$/, "") || defaultTextOutputBaseName);
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : t("tools.image-base64.ui.couldNotConvert"));
    }
  };

  const copyText = async (target: ImageBase64CopyTarget) => {
    if (!imageMetadata) return;
    try {
      await navigator.clipboard.writeText(target === "base64" ? imageMetadata.base64 : imageMetadata.dataUrl);
      setCopiedTarget(target);
      window.setTimeout(() => setCopiedTarget(null), 1800);
    } catch {
      setError(t("tools.image-base64.ui.couldNotCopy"));
    }
  };

  const downloadText = () => {
    if (!imageMetadata) return;
    const content = `Base64:\n${imageMetadata.base64}\n\nData URL:\n${imageMetadata.dataUrl}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = buildBase64TextFileName(textOutputBaseName);
    link.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setImageMetadata(null);
    setTextOutputBaseName(defaultTextOutputBaseName);
    setStatus("idle");
    setError(null);
    setCopiedTarget(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(310px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-base64.ui.sourceTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{intro}</p>
            <p className="mt-1 text-xs leading-5 text-ink-500">{localNote}</p>
          </div>

          <button
            className={cn(
              "grid min-h-44 place-items-center rounded-lg border border-dashed p-6 text-center transition",
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
                <Upload size={24} />
              </span>
              <span className="mt-3 block text-base font-semibold text-ink-900">{t("imageUi.selectImage")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("imageUi.dropImageHintShort")}</span>
            </span>
          </button>

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

          {status === "reading" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("imageUi.reading")}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {error}
            </p>
          ) : null}

          {imageMetadata ? (
            <dl className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm shadow-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">{t("imageUi.fileName")}</dt>
                <dd className="truncate font-semibold text-ink-900">{imageMetadata.fileName}</dd>
              </div>
              <div>
                <dt className="text-ink-500">{t("imageUi.type")}</dt>
                <dd className="font-semibold text-ink-900">{getMimeLabel(imageMetadata.mimeType)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">{t("imageUi.originalSize")}</dt>
                <dd className="font-semibold text-ink-900">{formatFileSize(imageMetadata.fileSize)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">{t("tools.image-base64.ui.detectedExtension")}</dt>
                <dd className="font-semibold text-ink-900">.{imageMetadata.extension}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-base64.ui.resultTitle")}</h3>
            <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.image-base64.ui.resultIntro")}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("tools.image-base64.ui.txtName")}
            <input
              className={inputClassName}
              value={textOutputBaseName}
              onChange={(event) => {
                setTextOutputBaseName(event.target.value);
                resetFeedback();
              }}
            />
          </label>

          {imageMetadata ? (
            <>
              <div
                className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-3 text-sm text-ink-700"
                dangerouslySetInnerHTML={{
                  __html: t("tools.image-base64.ui.textSize", {
                    size: formatFileSize(imageMetadata.textSize),
                  }),
                }}
              />
              <textarea className={textareaClassName} readOnly value={imageMetadata.dataUrl} />
              <div className="grid gap-2">
                <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyText("base64")}>
                  <Clipboard size={16} />
                  {getCopyLabel("base64")}
                </Button>
                <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyText("data-url")}>
                  <Clipboard size={16} />
                  {getCopyLabel("data-url")}
                </Button>
                <Button type="button" className="gap-2" onClick={downloadText}>
                  <Download size={16} />
                  {t("tools.image-base64.ui.downloadTxt")}
                </Button>
                <Button type="button" variant="ghost" className="gap-2" onClick={clear}>
                  <RotateCcw size={16} />
                  {t("toolUi.clear")}
                </Button>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              {t("tools.image-base64.ui.pickFirstImage")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
