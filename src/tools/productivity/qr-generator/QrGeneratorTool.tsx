import { Clipboard, Download, QrCode, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import { generateQrPng, resolveQrOutputSize, validateQrInput } from "./qrGenerator.service";
import type { QrContentType, QrGenerationResult, QrSize } from "./qrGenerator.types";

const inputClassName =
  "min-h-12 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

const contentTypeLabelKeys: Record<QrContentType, TranslationKey> = {
  text: "tools.qr-generator.ui.copy.text.label",
  url: "tools.qr-generator.ui.copy.url.label",
  email: "tools.qr-generator.ui.copy.email.label",
  phone: "tools.qr-generator.ui.copy.phone.label",
};
const placeholderKeys: Record<QrContentType, TranslationKey> = {
  text: "tools.qr-generator.ui.copy.text.placeholder",
  url: "tools.qr-generator.ui.copy.url.placeholder",
  email: "tools.qr-generator.ui.copy.email.placeholder",
  phone: "tools.qr-generator.ui.copy.phone.placeholder",
};
const helpKeys: Record<QrContentType, TranslationKey> = {
  text: "tools.qr-generator.ui.copy.text.help",
  url: "tools.qr-generator.ui.copy.url.help",
  email: "tools.qr-generator.ui.copy.email.help",
  phone: "tools.qr-generator.ui.copy.phone.help",
};
const warningKeys: Record<Exclude<QrContentType, "text">, TranslationKey> = {
  url: "tools.qr-generator.ui.warnings.url",
  email: "tools.qr-generator.ui.warnings.email",
  phone: "tools.qr-generator.ui.warnings.phone",
};

const sizeOptionLabelKeys: Record<QrSize, TranslationKey> = {
  small: "tools.qr-generator.ui.size.small2",
  medium: "tools.qr-generator.ui.size.medium2",
  large: "tools.qr-generator.ui.size.large2",
  custom: "tools.qr-generator.ui.size.custom2",
};

const sizeOptionOrder: QrSize[] = ["small", "medium", "large", "custom"];
const contentTypeOrder: QrContentType[] = ["text", "url", "email", "phone"];

export function QrGeneratorTool() {
  const { t } = useI18n();
  const defaultOutputBaseName = t("tools.qr-generator.ui.defaultFileName");
  const [contentType, setContentType] = useState<QrContentType>("text");
  const [input, setInput] = useState("");
  const [size, setSize] = useState<QrSize>("medium");
  const [customSizeInput, setCustomSizeInput] = useState("500");
  const [qrResult, setQrResult] = useState<QrGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);

  const trimmedInput = input.trim();
  const validation = useMemo(() => validateQrInput(contentType, input), [contentType, input]);
  const outputSize = useMemo(() => resolveQrOutputSize(size, customSizeInput), [customSizeInput, size]);
  const hasContent = trimmedInput.length > 0;
  const finalOutputFileName = buildDownloadFileName(outputFileName, "png", defaultOutputBaseName);
  const contentLabel = t(contentTypeLabelKeys[contentType]);
  const contentPlaceholder = t(placeholderKeys[contentType]);
  const helpText = t(helpKeys[contentType]);
  const warningText =
    validation.isWarning && contentType !== "text" ? t(warningKeys[contentType]) : null;

  useEffect(() => {
    let isCancelled = false;
    setQrResult(null);
    setGenerationError(null);

    if (!hasContent || !outputSize.pixels) {
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    generateQrPng(contentType, input, outputSize.pixels)
      .then((result) => {
        if (!isCancelled) {
          setQrResult(result);
          setIsGenerating(false);
          setGenerationError(null);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setQrResult(null);
          setIsGenerating(false);
          setGenerationError(t("tools.qr-generator.ui.couldNotGenerate"));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [contentType, hasContent, input, outputSize.pixels, t]);

  const copyOriginalContent = async () => {
    if (!hasContent) return;
    try {
      await navigator.clipboard.writeText(trimmedInput);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const clearAll = () => {
    setInput("");
    setQrResult(null);
    setIsGenerating(false);
    setGenerationError(null);
    setCopyStatus("idle");
    setOutputFileName(defaultOutputBaseName);
  };

  const downloadPng = () => {
    if (!qrResult) return;
    const link = document.createElement("a");
    link.href = qrResult.dataUrl;
    link.download = finalOutputFileName;
    link.click();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-5">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.qr-generator.ui.contentTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.qr-generator.ui.contentIntro")}</p>
          </div>

          <div
            className={cn(
              "grid items-start gap-4",
              size === "custom"
                ? "md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.68fr)_minmax(11rem,0.95fr)]"
                : "sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.64fr)]",
            )}
          >
            <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
              {t("tools.qr-generator.ui.typeOptionLabel")}
              <select
                className={cn(inputClassName, "w-full")}
                value={contentType}
                onChange={(event) => {
                  setQrResult(null);
                  setContentType(event.target.value as QrContentType);
                  setCopyStatus("idle");
                }}
              >
                {contentTypeOrder.map((value) => (
                  <option key={value} value={value}>
                    {t(contentTypeLabelKeys[value])}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
              {t("tools.qr-generator.ui.sizeOptionLabel")}
              <select
                className={cn(inputClassName, "w-full")}
                value={size}
                onChange={(event) => {
                  setQrResult(null);
                  setSize(event.target.value as QrSize);
                }}
              >
                {sizeOptionOrder.map((value) => (
                  <option key={value} value={value}>
                    {t(sizeOptionLabelKeys[value])}
                  </option>
                ))}
              </select>
            </label>

            {size === "custom" ? (
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                {t("tools.qr-generator.ui.customLabel")}
                <input
                  className={cn(inputClassName, "w-full")}
                  inputMode="numeric"
                  min={128}
                  max={2048}
                  placeholder={t("tools.qr-generator.ui.customPlaceholder")}
                  step={1}
                  type="number"
                  value={customSizeInput}
                  onChange={(event) => {
                    setQrResult(null);
                    setCustomSizeInput(event.target.value);
                  }}
                />
                <span className="text-xs font-normal leading-5 text-ink-500">
                  {outputSize.pixels
                    ? t("tools.qr-generator.ui.customWillUse", { px: outputSize.pixels })
                    : t("tools.qr-generator.ui.customHint")}
                </span>
                {outputSize.error ? <span role="alert" className="text-sm font-normal text-ink-700">{outputSize.error}</span> : null}
              </label>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {contentLabel}
            <textarea
              className="min-h-44 resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm font-normal leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
              placeholder={contentPlaceholder}
              value={input}
              onChange={(event) => {
                setQrResult(null);
                setInput(event.target.value);
                setCopyStatus("idle");
              }}
            />
          </label>

          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm leading-6",
              validation.isWarning ? "border-accent-violet/35 bg-accent-violet/8 text-ink-700" : "border-surface-200/80 bg-surface-50/80 text-ink-500",
            )}
          >
            {warningText ?? helpText}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={copyOriginalContent} disabled={!hasContent}>
              <Clipboard size={16} />
              {copyStatus === "copied" ? t("toolUi.copied") : t("toolUi.copyContent")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearAll}
              disabled={!hasContent && outputFileName === defaultOutputBaseName}
            >
              <Trash2 size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>

          {copyStatus === "error" ? (
            <p role="alert" className="text-sm font-semibold text-ink-700">
              {t("tools.qr-generator.ui.copyError")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.qr-generator.ui.previewTitle2")}</h3>
            <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.qr-generator.ui.previewIntro2")}</p>
          </div>
          <Button type="button" className="gap-2" onClick={downloadPng} disabled={!qrResult || !outputSize.pixels || isGenerating}>
            <Download size={16} />
            {t("toolUi.downloadPng")}
          </Button>
        </div>

        <p
          className={cn(
            "mt-4 rounded-md border px-3 py-3 text-sm font-semibold",
            outputSize.pixels
              ? "border-accent-cyan/25 bg-accent-cyan/10 text-ink-900"
              : "border-accent-violet/25 bg-accent-violet/8 text-ink-700",
          )}
        >
          {outputSize.pixels
            ? t("tools.qr-generator.ui.outputSizeOk", { px: outputSize.pixels })
            : t("tools.qr-generator.ui.outputSizeMissing")}
        </p>

        <label className="mt-4 grid gap-1.5 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm font-semibold text-ink-700 shadow-sm">
          {t("toolUi.outputName")}
          <input
            className={cn(inputClassName, "w-full")}
            value={outputFileName}
            placeholder={defaultOutputBaseName}
            onChange={(event) => setOutputFileName(event.target.value)}
          />
          <span className="break-all text-xs font-normal leading-5 text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
        </label>

        <div className="mt-5 grid min-h-80 place-items-center rounded-xl border border-surface-200/80 bg-surface-50/80 p-5 shadow-sm">
          {qrResult && !isGenerating ? (
            <img
              alt={t("tools.qr-generator.ui.previewAlt")}
              className="h-auto max-h-[352px] w-full max-w-[352px] rounded-lg border border-surface-200/80 bg-surface-50 p-2 shadow-sm"
              src={qrResult.dataUrl}
            />
          ) : (
            <div aria-live={isGenerating ? "polite" : undefined} role={isGenerating ? "status" : undefined} className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <QrCode size={26} />
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-900">{isGenerating ? t("tools.qr-generator.ui.generating") : t("tools.qr-generator.ui.idleTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                {isGenerating ? t("tools.qr-generator.ui.generatingBody") : t("tools.qr-generator.ui.idleBody")}
              </p>
            </div>
          )}
        </div>

        {generationError ? <p role="alert" className="mt-3 text-sm font-semibold text-ink-700">{generationError}</p> : null}
      </section>
    </div>
  );
}
