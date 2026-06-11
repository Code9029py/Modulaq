import { Download, FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import {
  addPageNumbersToFile,
  defaultOutputBaseName,
  formatFileSize,
  getOutputFileName,
  getSuggestedOutputBaseName,
  isPdfFile,
  previewPageNumberLabel,
  readPdfMetadata,
  STARTING_NUMBER_MAX,
  validateAddPageNumbersOptions,
} from "./addPageNumbers.service";
import type {
  AddPageNumbersFormOptions,
  AddPageNumbersMetadata,
  AddPageNumbersStatus,
  PageNumberFormatPreset,
  PageNumberPosition,
} from "./addPageNumbers.types";

const inputClassName =
  "min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

const positions: readonly PageNumberPosition[] = ["bottom-left", "bottom-center", "bottom-right"];
const formats: readonly PageNumberFormatPreset[] = [
  "n",
  "n-of-total",
  "page-n",
  "page-n-of-total",
  "pag-n",
  "pag-n-of-total",
];

const defaultFormOptions: AddPageNumbersFormOptions = {
  position: "bottom-center",
  format: "n-of-total",
  startPage: 1,
  startingNumber: 1,
};

export function AddPageNumbersTool() {
  const { language, t } = useI18n();
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AddPageNumbersMetadata | null>(null);
  const [options, setOptions] = useState<AddPageNumbersFormOptions>(defaultFormOptions);
  const [startPageInput, setStartPageInput] = useState(String(defaultFormOptions.startPage));
  const [startingNumberInput, setStartingNumberInput] = useState(
    String(defaultFormOptions.startingNumber),
  );
  const [status, setStatus] = useState<AddPageNumbersStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputBaseName, setOutputBaseName] = useState(defaultOutputBaseName);
  const [hasCustomOutputName, setHasCustomOutputName] = useState(false);
  const [lastSummary, setLastSummary] = useState<{ numbered: number; total: number } | null>(null);

  const isBusy = status === "reading" || status === "processing";
  const fallbackBaseName = metadata ? getSuggestedOutputBaseName(metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = useMemo(
    () => getOutputFileName(outputBaseName, fallbackBaseName),
    [outputBaseName, fallbackBaseName],
  );

  const parsedStartPage = Number(startPageInput);
  const parsedStartingNumber = Number(startingNumberInput);
  const liveOptions: AddPageNumbersFormOptions = {
    ...options,
    startPage: parsedStartPage,
    startingNumber: parsedStartingNumber,
  };

  // Validación dinámica solo si ya hay metadata. Sin file, no se grita.
  const liveValidation = useMemo(() => {
    if (!metadata) return null;
    if (startPageInput.trim().length === 0) {
      return { code: "tools.errors.startPageInvalid" } as const;
    }
    if (startingNumberInput.trim().length === 0) {
      return { code: "tools.errors.startingNumberInvalid" } as const;
    }
    return validateAddPageNumbersOptions(liveOptions, metadata.pageCount);
  }, [metadata, startPageInput, startingNumberInput, liveOptions]);

  const liveError =
    liveValidation
      ? t(
          liveValidation.code as TranslationKey,
          "vars" in liveValidation ? liveValidation.vars : undefined,
        )
      : null;

  const canRun = Boolean(metadata) && !isBusy && !liveValidation;

  // Vista previa del label resuelto para el formato/posición elegidos.
  const previewLabel = useMemo(() => {
    const safeTotal = metadata
      ? Math.max(1, metadata.pageCount - Math.max(1, parsedStartPage) + 1)
      : 5;
    const safeNumber = Number.isFinite(parsedStartingNumber) && parsedStartingNumber >= 1
      ? parsedStartingNumber
      : 1;
    return previewPageNumberLabel(options.format, language, safeNumber, safeTotal);
  }, [language, metadata, options.format, parsedStartPage, parsedStartingNumber]);

  const resetFeedback = () => {
    setError(null);
    setLastSummary(null);
    if (status === "success" || status === "error") {
      setStatus(metadata ? "ready" : "idle");
    }
  };

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return;
    setLastSummary(null);
    setError(null);

    if (!isPdfFile(selected)) {
      setStatus("error");
      setError(t("toolUi.invalidPdfPicked"));
      return;
    }
    const limitError = limitLabels.getPdfFileSizeLimitError(selected);
    if (limitError) {
      setStatus("error");
      setError(limitError);
      return;
    }

    setStatus("reading");
    try {
      const meta = await readPdfMetadata(selected);
      setFile(selected);
      setMetadata(meta);
      if (!hasCustomOutputName) {
        setOutputBaseName(getSuggestedOutputBaseName(meta.fileName));
      }
      // Si la página inicial actual queda fuera del nuevo PDF, normalizar a 1.
      if (parsedStartPage > meta.pageCount || parsedStartPage < 1) {
        setStartPageInput("1");
      }
      setStatus("ready");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "toolUi.couldNotReadFile"));
    }
  };

  const downloadPdf = (bytes: ArrayBuffer, fileName: string) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    if (!file || !canRun) return;
    setStatus("processing");
    setError(null);
    setLastSummary(null);

    try {
      const result = await addPageNumbersToFile(file, liveOptions, outputBaseName, language);
      downloadPdf(result.bytes, result.fileName);
      setLastSummary({ numbered: result.numberedPages, total: result.pageCount });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.addPageNumbersFailed"));
    }
  };

  const clearAll = () => {
    setFile(null);
    setMetadata(null);
    setOptions(defaultFormOptions);
    setStartPageInput(String(defaultFormOptions.startPage));
    setStartingNumberInput(String(defaultFormOptions.startingNumber));
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    setOutputBaseName(defaultOutputBaseName);
    setHasCustomOutputName(false);
    setLastSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.add-page-numbers.ui.fileSection")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.add-page-numbers.ui.intro")}</p>
          </div>

          <button
            className={cn(
              "grid min-h-52 place-items-center rounded-lg border border-dashed p-6 text-center transition",
              isDragging ? "border-accent-cyan bg-accent-cyan/10" : "border-surface-200/80 bg-surface-50/80 hover:border-accent-cyan/55 hover:bg-surface-50",
            )}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={26} />
              </span>
              <span className="mt-4 block text-base font-semibold text-ink-900">{t("toolUi.uploadPdf")}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("toolUi.dropHere")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{limitLabels.pdfSingle}</p>

          <input
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            className="hidden"
            type="file"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {metadata ? (
            <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
              <p className="truncate text-sm font-semibold text-ink-900">{metadata.fileName}</p>
              <p className="mt-1 text-xs text-ink-500">
                {formatFileSize(metadata.fileSize)} · {metadata.pageCount} {metadata.pageCount === 1 ? t("toolUi.pagesSingular") : t("toolUi.pagesPlural")}
              </p>
            </div>
          ) : null}

          <div className="grid items-start gap-3 sm:grid-cols-2">
            <fieldset className="grid auto-rows-min gap-2 text-sm font-semibold text-ink-700">
              <legend className="mb-1">{t("tools.add-page-numbers.ui.positionLabel")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {positions.map((position) => {
                  const isActive = options.position === position;
                  return (
                    <button
                      key={position}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setOptions((prev) => ({ ...prev, position }));
                        resetFeedback();
                      }}
                      className={cn(
                        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25 sm:text-sm",
                        isActive
                          ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                          : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
                      )}
                    >
                      {t(`tools.add-page-numbers.ui.position.${position}` as const)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="grid auto-rows-min gap-1.5 text-sm font-semibold text-ink-700">
              {t("tools.add-page-numbers.ui.formatLabel")}
              <select
                className={inputClassName}
                value={options.format}
                onChange={(event) => {
                  setOptions((prev) => ({ ...prev, format: event.target.value as PageNumberFormatPreset }));
                  resetFeedback();
                }}
              >
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {t(`tools.add-page-numbers.ui.format.${format}` as const)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid items-start gap-3 sm:grid-cols-2">
            <label className="grid auto-rows-min gap-1.5 text-sm font-semibold text-ink-700">
              {t("tools.add-page-numbers.ui.startPageLabel")}
              <input
                type="number"
                inputMode="numeric"
                className={inputClassName}
                value={startPageInput}
                min={1}
                max={metadata?.pageCount ?? undefined}
                step={1}
                disabled={!metadata}
                onChange={(event) => {
                  setStartPageInput(event.target.value);
                  resetFeedback();
                }}
              />
            </label>
            <label className="grid auto-rows-min gap-1.5 text-sm font-semibold text-ink-700">
              {t("tools.add-page-numbers.ui.startingNumberLabel")}
              <input
                type="number"
                inputMode="numeric"
                className={inputClassName}
                value={startingNumberInput}
                min={1}
                max={STARTING_NUMBER_MAX}
                step={1}
                onChange={(event) => {
                  setStartingNumberInput(event.target.value);
                  resetFeedback();
                }}
              />
            </label>
          </div>

          <p className="text-xs leading-5 text-ink-500">{t("tools.add-page-numbers.ui.rangeHelp")}</p>

          {liveError ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {liveError}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.add-page-numbers.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.add-page-numbers.ui.outputIntro")}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
              {t("tools.add-page-numbers.ui.formatLabel")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink-900">{previewLabel}</p>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
            {t("toolUi.outputNameDownload")}
            <input
              className={inputClassName}
              value={outputBaseName}
              placeholder={defaultOutputBaseName}
              onChange={(event) => {
                setOutputBaseName(event.target.value);
                setHasCustomOutputName(true);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
          </label>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("tools.add-page-numbers.ui.processing")}
            </p>
          ) : null}

          {status === "success" && lastSummary ? (
            <p className="rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700">
              {t("tools.add-page-numbers.ui.successSummary", { numbered: lastSummary.numbered, total: lastSummary.total })}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">{error}</p>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void handleRun()} disabled={!canRun}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {t("tools.add-page-numbers.ui.cta")}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={!file && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>

          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-ink-500">
            <FileText className="mt-0.5 shrink-0 text-accent-teal" size={14} />
            {t("tools.add-page-numbers.ui.localProcessingNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
