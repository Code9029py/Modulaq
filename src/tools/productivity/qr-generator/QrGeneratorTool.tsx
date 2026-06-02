import { Clipboard, Download, QrCode, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import { generateQrPng, qrContentCopy, resolveQrOutputSize, validateQrInput } from "./qrGenerator.service";
import type { QrContentType, QrGenerationResult, QrSize } from "./qrGenerator.types";

const contentTypes: Array<{ label: string; value: QrContentType }> = [
  { label: "Texto libre", value: "text" },
  { label: "URL", value: "url" },
  { label: "Email", value: "email" },
  { label: "Teléfono", value: "phone" },
];

const sizeOptions: Array<{ label: string; value: QrSize }> = [
  { label: "Pequeño", value: "small" },
  { label: "Mediano", value: "medium" },
  { label: "Grande", value: "large" },
  { label: "Personalizado", value: "custom" },
];

const inputClassName =
  "min-h-12 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";
const defaultOutputBaseName = "qr";

export function QrGeneratorTool() {
  const [contentType, setContentType] = useState<QrContentType>("text");
  const [input, setInput] = useState("");
  const [size, setSize] = useState<QrSize>("medium");
  const [customSizeInput, setCustomSizeInput] = useState("500");
  const [qrResult, setQrResult] = useState<QrGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);

  const copy = qrContentCopy[contentType];
  const trimmedInput = input.trim();
  const validation = useMemo(() => validateQrInput(contentType, input), [contentType, input]);
  const outputSize = useMemo(() => resolveQrOutputSize(size, customSizeInput), [customSizeInput, size]);
  const hasContent = trimmedInput.length > 0;
  const finalOutputFileName = buildDownloadFileName(outputFileName, "png", defaultOutputBaseName);

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
          setGenerationError("No se pudo generar el QR. Revisá el contenido e intentá de nuevo.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [contentType, hasContent, input, outputSize.pixels]);

  const copyOriginalContent = async () => {
    if (!hasContent) {
      return;
    }

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
    if (!qrResult) {
      return;
    }

    const link = document.createElement("a");
    link.href = qrResult.dataUrl;
    link.download = finalOutputFileName;
    link.click();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-5">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Contenido del QR</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">Elegí el tipo, escribí el contenido y Modulaq genera la vista previa automáticamente.</p>
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
              Tipo de contenido
              <select
                className={cn(inputClassName, "w-full")}
                value={contentType}
                onChange={(event) => {
                  setQrResult(null);
                  setContentType(event.target.value as QrContentType);
                  setCopyStatus("idle");
                }}
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
              Tamaño
              <select
                className={cn(inputClassName, "w-full")}
                value={size}
                onChange={(event) => {
                  setQrResult(null);
                  setSize(event.target.value as QrSize);
                }}
              >
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {size === "custom" ? (
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink-700">
                Tamaño personalizado
                <input
                  className={cn(inputClassName, "w-full")}
                  inputMode="numeric"
                  min={128}
                  max={2048}
                  placeholder="Ej: 500"
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
                    ? `Se usará como ${outputSize.pixels} × ${outputSize.pixels} px.`
                    : "Ingresá un valor entero entre 128 y 2048 px."}
                </span>
                {outputSize.error ? <span role="alert" className="text-sm font-normal text-ink-700">{outputSize.error}</span> : null}
              </label>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {copy.label}
            <textarea
              className="min-h-44 resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm font-normal leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25"
              placeholder={copy.placeholder}
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
            {validation.message ?? copy.help}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={copyOriginalContent} disabled={!hasContent}>
              <Clipboard size={16} />
              {copyStatus === "copied" ? "Copiado" : "Copiar contenido"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={clearAll}
              disabled={!hasContent && outputFileName === defaultOutputBaseName}
            >
              <Trash2 size={16} />
              Limpiar todo
            </Button>
          </div>

          {copyStatus === "error" ? (
            <p role="alert" className="text-sm font-semibold text-ink-700">No se pudo copiar automáticamente. Podés seleccionar el contenido y copiarlo manualmente.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Vista previa</h3>
            <p className="mt-1 text-xs leading-5 text-ink-500">La vista se ajusta al panel. El PNG conserva su resolución final.</p>
          </div>
          <Button type="button" className="gap-2" onClick={downloadPng} disabled={!qrResult || !outputSize.pixels || isGenerating}>
            <Download size={16} />
            Descargar PNG
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
            ? `Tamaño de salida: ${outputSize.pixels} × ${outputSize.pixels} px`
            : "Tamaño de salida: ingresá un valor válido para generar el PNG."}
        </p>

        <label className="mt-4 grid gap-1.5 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 text-sm font-semibold text-ink-700 shadow-sm">
          Nombre del archivo
          <input
            className={cn(inputClassName, "w-full")}
            value={outputFileName}
            placeholder={defaultOutputBaseName}
            onChange={(event) => setOutputFileName(event.target.value)}
          />
          <span className="break-all text-xs font-normal leading-5 text-ink-500">Se descargará como {finalOutputFileName}</span>
        </label>

        <div className="mt-5 grid min-h-80 place-items-center rounded-xl border border-surface-200/80 bg-surface-50/80 p-5 shadow-sm">
          {qrResult && !isGenerating ? (
            <img
              alt="Vista previa del código QR generado"
              className="h-auto max-h-[352px] w-full max-w-[352px] rounded-lg border border-surface-200/80 bg-surface-50 p-2 shadow-sm"
              src={qrResult.dataUrl}
            />
          ) : (
            <div aria-live={isGenerating ? "polite" : undefined} role={isGenerating ? "status" : undefined} className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <QrCode size={26} />
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-900">{isGenerating ? "Generando QR..." : "Sin contenido todavía"}</p>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                {isGenerating
                  ? "La descarga se habilitará cuando el nuevo PNG esté listo."
                  : "Escribí texto, una URL, un correo o un teléfono para generar el QR automáticamente."}
              </p>
            </div>
          )}
        </div>

        {generationError ? <p role="alert" className="mt-3 text-sm font-semibold text-ink-700">{generationError}</p> : null}
      </section>
    </div>
  );
}
