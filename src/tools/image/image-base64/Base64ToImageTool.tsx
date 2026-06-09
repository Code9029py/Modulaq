import { Download, FileImage, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { cn } from "../../../shared/utils/cn";
import type { BrowserImageMimeType } from "../../../shared/utils/imageFiles";
import {
  base64ImageMimeTypes,
  buildBase64ImageFileName,
  defaultImageOutputBaseName,
  formatFileSize,
  getBase64TextSize,
  getMimeLabel,
  inferExtensionFromMime,
  parseBase64ImageInput,
} from "./imageBase64.service";
import type { Base64ImageResult, ImageBase64Status } from "./imageBase64.types";

const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";
const textareaClassName = cn(inputClassName, "min-h-56 resize-y py-3 font-mono text-xs leading-5");

type ReconstructedImage = Base64ImageResult & {
  url: string;
};

export function Base64ToImageTool() {
  const { t } = useI18n();
  const previewUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ImageBase64Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [base64Input, setBase64Input] = useState("");
  const [fallbackMimeType, setFallbackMimeType] = useState<BrowserImageMimeType>("image/png");
  const [imageOutputBaseName, setImageOutputBaseName] = useState(defaultImageOutputBaseName);
  const [reconstructedImage, setReconstructedImage] = useState<ReconstructedImage | null>(null);

  const intro = t("tools.image-base64.ui.base64ToImageHeadIntro");
  const warning = t("tools.image-base64.ui.base64ToImageWarning");

  const clearPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const resetFeedback = () => {
    setError(null);
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  };

  const reconstructImage = () => {
    setStatus("processing");
    setError(null);
    clearPreviewUrl();
    setReconstructedImage(null);

    try {
      const parsed = parseBase64ImageInput(base64Input, fallbackMimeType);
      const url = URL.createObjectURL(parsed.blob);
      previewUrlRef.current = url;
      setReconstructedImage({
        ...parsed,
        fileName: buildBase64ImageFileName(imageOutputBaseName, parsed.mimeType),
        url,
      });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.image-base64.ui.couldNotReconstruct"));
    }
  };

  const downloadImage = () => {
    if (!reconstructedImage) return;
    const link = document.createElement("a");
    link.href = reconstructedImage.url;
    link.download = reconstructedImage.fileName;
    link.click();
  };

  const clear = () => {
    clearPreviewUrl();
    setBase64Input("");
    setFallbackMimeType("image/png");
    setImageOutputBaseName(defaultImageOutputBaseName);
    setReconstructedImage(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(310px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-base64.ui.base64Source")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{intro}</p>
            <p className="mt-1 text-xs leading-5 text-ink-500">{warning}</p>
          </div>
          <textarea
            className={textareaClassName}
            placeholder={t("tools.image-base64.ui.base64Placeholder")}
            value={base64Input}
            onChange={(event) => {
              setBase64Input(event.target.value);
              resetFeedback();
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("tools.image-base64.ui.fallbackType")}
              <select
                className={inputClassName}
                value={fallbackMimeType}
                onChange={(event) => {
                  setFallbackMimeType(event.target.value as BrowserImageMimeType);
                  resetFeedback();
                }}
              >
                {base64ImageMimeTypes.map((mimeType) => (
                  <option key={mimeType} value={mimeType}>
                    {getMimeLabel(mimeType)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              {t("tools.image-base64.ui.imageName")}
              <input
                className={inputClassName}
                value={imageOutputBaseName}
                onChange={(event) => {
                  setImageOutputBaseName(event.target.value);
                  resetFeedback();
                }}
              />
            </label>
          </div>
          {error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {error}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Button type="button" className="gap-2" onClick={reconstructImage} disabled={!base64Input.trim()}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <FileImage size={16} />}
              {t("tools.image-base64.ui.reconstructCta")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clear}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.image-base64.ui.reconstructedTitle")}</h3>
            <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.image-base64.ui.reconstructedIntro")}</p>
          </div>

          {reconstructedImage ? (
            <div className="grid gap-3">
              <img
                src={reconstructedImage.url}
                alt=""
                className="max-h-72 w-full rounded-lg border border-surface-200/80 bg-surface-50 object-contain shadow-sm"
                onError={() => {
                  setStatus("error");
                  setError(t("tools.image-base64.ui.invalidMime"));
                  clearPreviewUrl();
                  setReconstructedImage(null);
                }}
              />
              <dl className="grid gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">{t("imageUi.type")}</dt>
                  <dd className="font-semibold text-ink-900">{getMimeLabel(reconstructedImage.mimeType)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("tools.image-base64.ui.extension")}</dt>
                  <dd className="font-semibold text-ink-900">.{inferExtensionFromMime(reconstructedImage.mimeType)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("tools.image-base64.ui.reconstructedSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(reconstructedImage.blob.size)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("tools.image-base64.ui.processedText")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(getBase64TextSize(reconstructedImage.base64))}</dd>
                </div>
              </dl>
              <Button type="button" className="gap-2" onClick={downloadImage}>
                <Download size={16} />
                {t("imageUi.downloadImage")}
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              {t("tools.image-base64.ui.pasteFirst")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
