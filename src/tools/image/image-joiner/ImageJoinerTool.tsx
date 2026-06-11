import {
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  FileImage,
  Grid3X3,
  Images,
  Loader2,
  RotateCcw,
  Rows3,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { OutputFormatSelector } from "../shared/OutputFormatSelector";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ToolError } from "../../../shared/errors/ToolError";
import { resolveToolErrorMessage } from "../../../shared/errors/resolveToolErrorMessage";
import { useFileProcessingLimitLabels } from "../../../shared/errors/useFileProcessingLimitLabels";
import { cn } from "../../../shared/utils/cn";
import { fileProcessingLimits } from "../../../shared/utils/fileProcessingLimits";
import {
  canExportBrowserImageFormat,
  jpegQualityDecimalToPercent,
  jpegQualityPercentToDecimal,
} from "../../../shared/utils/imageFiles";
import {
  buildJoinedImageFileName,
  calculateImageJoinerLayout,
  defaultOutputBaseName,
  formatFileSize,
  getImageFormatLabel,
  getImageMimeLabel,
  getJoinedImageOutputBaseName,
  isJoinableImageFile,
  joinImageFiles,
  readImageMetadata,
  validateImageJoinerOptions,
} from "./imageJoiner.service";
import type {
  ImageJoinerLayoutOptions,
  ImageJoinerMetadata,
  ImageJoinerMode,
  ImageJoinerOutputFormat,
  ImageJoinerResult,
  ImageJoinerSource,
  ImageJoinerStatus,
} from "./imageJoiner.types";

const acceptedImageTypes = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type ImageJoinerItem = {
  file: File;
  metadata: ImageJoinerMetadata;
  previewUrl: string;
};

type DownloadableResult = ImageJoinerResult & {
  url: string;
};

const baseOutputFormats: ImageJoinerOutputFormat[] = ["png", "jpeg"];

const formatDescKeys: Record<ImageJoinerOutputFormat, TranslationKey> = {
  png: "imageUi.png.desc",
  jpeg: "imageUi.jpg.desc",
  webp: "imageUi.webp.desc",
};

const copy = {
  es: {
    addImages: "Agregar imagenes",
    background: "Color de fondo",
    columns: "Columnas",
    downloadReady: "Imagen unida lista",
    emptyList: "Agrega al menos dos imagenes para preparar la union.",
    grid: "Cuadricula",
    horizontal: "Horizontal",
    joinCta: "Unir imagenes",
    layoutTitle: "Orden y composicion",
    mode: "Modo de union",
    outputTitle: "Vista previa y salida",
    padding: "Padding exterior",
    previewAlt: "Vista previa de imagenes unidas",
    processing: "Uniendo imagenes...",
    remove: "Eliminar",
    sourceIntro: "Subí dos o más imágenes y elegí cómo unirlas.",
    sourceTitle: "Imagenes",
    spacing: "Separacion",
    vertical: "Vertical",
    webpHint: "WebP aparece si tu navegador permite exportarlo correctamente.",
  },
  en: {
    addImages: "Add images",
    background: "Background color",
    columns: "Columns",
    downloadReady: "Joined image ready",
    emptyList: "Add at least two images to prepare the join.",
    grid: "Grid",
    horizontal: "Horizontal",
    joinCta: "Join images",
    layoutTitle: "Order and composition",
    mode: "Join mode",
    outputTitle: "Preview and output",
    padding: "Outer padding",
    previewAlt: "Joined images preview",
    processing: "Joining images...",
    remove: "Remove",
    sourceIntro: "Upload two or more images and pick how to join them.",
    sourceTitle: "Images",
    spacing: "Spacing",
    vertical: "Vertical",
    webpHint: "WebP appears if your browser can export it correctly.",
  },
} as const;

const modeConfig = {
  vertical: { icon: Rows3, key: "vertical" },
  horizontal: { icon: Columns3, key: "horizontal" },
  grid: { icon: Grid3X3, key: "grid" },
} as const satisfies Record<ImageJoinerMode, { icon: typeof Rows3; key: keyof typeof copy.es }>;

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function stringifyNumber(value: number) {
  return String(Math.max(0, Math.round(value)));
}

function createEntryId(file: File, index: number) {
  return `${Date.now()}-${index}-${file.name}`;
}

function getPreviewImageStyle(position: { height: number; width: number; x: number; y: number }, layoutWidth: number, layoutHeight: number) {
  return {
    height: `${(position.height / layoutHeight) * 100}%`,
    left: `${(position.x / layoutWidth) * 100}%`,
    top: `${(position.y / layoutHeight) * 100}%`,
    width: `${(position.width / layoutWidth) * 100}%`,
  };
}

export function ImageJoinerTool() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const limitLabels = useFileProcessingLimitLabels();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const itemsRef = useRef<ImageJoinerItem[]>([]);
  const [items, setItems] = useState<ImageJoinerItem[]>([]);
  const [mode, setMode] = useState<ImageJoinerMode>("vertical");
  const [columnsInput, setColumnsInput] = useState("2");
  const [spacingInput, setSpacingInput] = useState("0");
  const [paddingInput, setPaddingInput] = useState("0");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [outputFormat, setOutputFormat] = useState<ImageJoinerOutputFormat>("png");
  const [qualityPercent, setQualityPercent] = useState(jpegQualityDecimalToPercent(0.92));
  const [outputFileName, setOutputFileName] = useState(defaultOutputBaseName);
  const [hasCustomOutputFileName, setHasCustomOutputFileName] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const [status, setStatus] = useState<ImageJoinerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    setWebpSupported(canExportBrowserImageFormat("webp"));
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const outputFormats = useMemo(
    () => (webpSupported ? [...baseOutputFormats, "webp" as const] : baseOutputFormats),
    [webpSupported],
  );
  const sources = useMemo<ImageJoinerSource[]>(
    () =>
      items.map((item) => ({
        height: item.metadata.height,
        id: item.metadata.id,
        width: item.metadata.width,
      })),
    [items],
  );
  const layoutOptions = useMemo<ImageJoinerLayoutOptions>(
    () => ({
      backgroundColor,
      columns: parseNumberInput(columnsInput),
      mode,
      padding: parseNumberInput(paddingInput),
      spacing: parseNumberInput(spacingInput),
    }),
    [backgroundColor, columnsInput, mode, paddingInput, spacingInput],
  );
  const layoutError = validateImageJoinerOptions(sources, layoutOptions);
  const layout = !layoutError ? calculateImageJoinerLayout(sources, layoutOptions) : null;
  const shouldShowQuality = outputFormat === "jpeg" || outputFormat === "webp";
  const fallbackBaseName = items[0] ? getJoinedImageOutputBaseName(items[0].metadata.fileName) : defaultOutputBaseName;
  const finalOutputFileName = buildJoinedImageFileName(outputFileName, outputFormat, fallbackBaseName);
  const canJoin = items.length >= 2 && !layoutError && status !== "reading" && status !== "processing";

  const clearResult = () => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
  };

  const resetFeedback = () => {
    setError(null);
    clearResult();
    if (status === "success" || status === "error") {
      setStatus(items.length > 0 ? "ready" : "idle");
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const nextFiles = Array.from(fileList);
    if (nextFiles.length === 0) return;

    setStatus("reading");
    setError(null);
    clearResult();

    const totalCount = items.length + nextFiles.length;
    if (totalCount > fileProcessingLimits.maxImageFileCount) {
      setStatus(items.length > 0 ? "ready" : "error");
      setError(t("tools.errors.tooManyImagesGeneric"));
      return;
    }

    const nextTotalSize = items.reduce((total, item) => total + item.file.size, 0) + nextFiles.reduce((total, file) => total + file.size, 0);
    const totalSizeError = limitLabels.getTotalImageSizeLimitError(nextTotalSize);
    if (totalSizeError) {
      setStatus(items.length > 0 ? "ready" : "error");
      setError(totalSizeError);
      return;
    }

    const preparedItems: ImageJoinerItem[] = [];
    let preparedError: string | null = null;
    try {
      for (const [index, file] of nextFiles.entries()) {
        const fileLimitError = limitLabels.getImageFileSizeLimitError(file);
        if (fileLimitError) {
          preparedError = fileLimitError;
          break;
        }

        if (!isJoinableImageFile(file)) {
          throw new ToolError("tools.errors.invalidImages");
        }

        const id = createEntryId(file, items.length + index);
        const metadata = await readImageMetadata(file, id);
        preparedItems.push({
          file,
          metadata,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (preparedError) {
        for (const item of preparedItems) {
          URL.revokeObjectURL(item.previewUrl);
        }
        setStatus(items.length > 0 ? "ready" : "error");
        setError(preparedError);
        return;
      }

      setItems((currentItems) => {
        const nextItems = [...currentItems, ...preparedItems];
        if (!hasCustomOutputFileName && nextItems[0]) {
          setOutputFileName(getJoinedImageOutputBaseName(nextItems[0].metadata.fileName));
        }
        return nextItems;
      });
      setStatus("ready");
    } catch (nextError) {
      for (const item of preparedItems) {
        URL.revokeObjectURL(item.previewUrl);
      }
      setStatus(items.length > 0 ? "ready" : "error");
      setError(resolveToolErrorMessage(nextError, t, "imageUi.couldNotRead"));
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((currentItems) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= currentItems.length) return currentItems;
      const nextItems = [...currentItems];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(nextIndex, 0, item);
      return nextItems;
    });
    resetFeedback();
  };

  const removeItem = (index: number) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems];
      const [removedItem] = nextItems.splice(index, 1);
      if (removedItem) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }
      return nextItems;
    });
    resetFeedback();
  };

  const clearSelection = () => {
    for (const item of items) {
      URL.revokeObjectURL(item.previewUrl);
    }
    clearResult();
    setItems([]);
    setMode("vertical");
    setColumnsInput("2");
    setSpacingInput("0");
    setPaddingInput("0");
    setBackgroundColor("#ffffff");
    setOutputFormat("png");
    setQualityPercent(jpegQualityDecimalToPercent(0.92));
    setOutputFileName(defaultOutputBaseName);
    setHasCustomOutputFileName(false);
    setStatus("idle");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const joinImages = async () => {
    if (!canJoin) return;
    setStatus("processing");
    setError(null);
    clearResult();

    try {
      const nextResult = await joinImageFiles(
        items.map((item) => item.file),
        {
          ...layoutOptions,
          outputBaseName: outputFileName,
          outputFormat,
          quality: shouldShowQuality ? jpegQualityPercentToDecimal(qualityPercent) : undefined,
        },
      );
      const resultUrl = URL.createObjectURL(new Blob([nextResult.bytes], { type: nextResult.mimeType }));
      resultUrlRef.current = resultUrl;
      setResult({ ...nextResult, url: resultUrl });
      setStatus("success");
    } catch (nextError) {
      setStatus("error");
      setError(resolveToolErrorMessage(nextError, t, "tools.errors.joinerFailed"));
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    link.click();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.96fr)_minmax(310px,0.52fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{labels.sourceTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{labels.sourceIntro}</p>
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
              void processFiles(event.dataTransfer.files);
            }}
          >
            <span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-surface-200 bg-surface-50 text-accent-teal">
                <Upload size={26} />
              </span>
              <span className="mt-4 block text-base font-semibold text-ink-900">{labels.addImages}</span>
              <span className="mt-2 block text-sm leading-6 text-ink-500">{t("imageUi.dropImageHint")}</span>
            </span>
          </button>
          <p className="text-xs leading-5 text-ink-600">{t("imageUi.maxSize")}</p>

          <input
            ref={fileInputRef}
            accept={acceptedImageTypes}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => {
              if (event.target.files) void processFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="grid gap-3">
            {items.length === 0 ? (
              <div className="rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 text-center text-sm text-ink-500 shadow-sm">
                <Images className="mx-auto text-accent-teal" size={30} />
                <p className="mt-2 font-semibold text-ink-700">{labels.emptyList}</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.metadata.id}
                  className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm sm:grid-cols-[88px_minmax(0,1fr)_auto]"
                >
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-20 w-full rounded-lg border border-surface-200/80 bg-surface-50 object-contain shadow-sm sm:w-20"
                  />
                  <dl className="grid min-w-0 gap-2 text-sm">
                    <div>
                      <dt className="text-ink-500">{t("imageUi.fileName")}</dt>
                      <dd className="truncate font-semibold text-ink-900">{item.metadata.fileName}</dd>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <dt className="text-ink-500">{t("imageUi.type")}</dt>
                        <dd className="font-semibold text-ink-900">{getImageMimeLabel(item.metadata.mimeType)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">{t("imageUi.originalSize")}</dt>
                        <dd className="font-semibold text-ink-900">{formatFileSize(item.metadata.fileSize)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">{t("imageUi.dimensions")}</dt>
                        <dd className="font-semibold text-ink-900">
                          {item.metadata.width} x {item.metadata.height}px
                        </dd>
                      </div>
                    </div>
                  </dl>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
                    <Button type="button" variant="secondary" className="h-9 px-2" disabled={index === 0} onClick={() => moveItem(index, -1)}>
                      <ArrowUp size={15} />
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-2" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>
                      <ArrowDown size={15} />
                    </Button>
                    <Button type="button" variant="ghost" className="h-9 px-2" onClick={() => removeItem(index)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{labels.layoutTitle}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(modeConfig) as ImageJoinerMode[]).map((nextMode) => {
                const Icon = modeConfig[nextMode].icon;
                return (
                  <button
                    key={nextMode}
                    type="button"
                    className={cn(
                      "rounded-md border p-3 text-left transition",
                      mode === nextMode
                        ? "border-accent-cyan/45 bg-accent-cyan/10"
                        : "border-surface-200/80 bg-surface-50/90 hover:border-accent-cyan/35",
                    )}
                    onClick={() => {
                      setMode(nextMode);
                      resetFeedback();
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <Icon size={16} />
                      {labels[modeConfig[nextMode].key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {mode === "grid" ? (
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  {labels.columns}
                  <input
                    className={inputClassName}
                    inputMode="numeric"
                    min={1}
                    type="number"
                    value={columnsInput}
                    onChange={(event) => {
                      setColumnsInput(event.target.value);
                      resetFeedback();
                    }}
                  />
                </label>
              ) : null}
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.spacing}
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  min={0}
                  type="number"
                  value={spacingInput}
                  onChange={(event) => {
                    setSpacingInput(event.target.value);
                    resetFeedback();
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.padding}
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  min={0}
                  type="number"
                  value={paddingInput}
                  onChange={(event) => {
                    setPaddingInput(event.target.value);
                    resetFeedback();
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {labels.background}
                <span className="flex min-h-11 items-center gap-2 rounded-lg border border-surface-200/90 bg-surface-50/95 px-2 shadow-sm">
                  <input
                    className="h-8 w-10 rounded border border-surface-200 bg-transparent"
                    type="color"
                    value={backgroundColor}
                    onChange={(event) => {
                      setBackgroundColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-ink-900 outline-none"
                    value={backgroundColor}
                    onChange={(event) => {
                      setBackgroundColor(event.target.value);
                      resetFeedback();
                    }}
                  />
                </span>
              </label>
            </div>

            {layoutError ? (
              <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
                {t(layoutError.code as TranslationKey, layoutError.vars)}
              </p>
            ) : null}
          </div>

          {status === "reading" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {t("imageUi.reading")}
            </p>
          ) : null}

          {status === "error" && error ? (
            <p role="alert" className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{labels.outputTitle}</h3>        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-4 shadow-sm">
          <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg border border-surface-200/80 bg-surface-50/90 p-3">
            {layout ? (
              <div
                className="relative w-full max-w-md overflow-hidden rounded-lg border border-surface-200/80 shadow-sm"
                style={{
                  aspectRatio: `${layout.width} / ${layout.height}`,
                  backgroundColor,
                }}
              >
                {layout.positions.map((position) => {
                  const item = items.find((nextItem) => nextItem.metadata.id === position.id);
                  if (!item) return null;

                  return (
                    <img
                      key={position.id}
                      alt=""
                      className="absolute object-fill"
                      src={item.previewUrl}
                      style={getPreviewImageStyle(position, layout.width, layout.height)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-sm text-ink-500">
                <FileImage className="mx-auto text-accent-teal" size={32} />
                <p className="mt-2 font-semibold text-ink-700">{items.length > 0 ? labels.emptyList : labels.addImages}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200/80 bg-surface-50/90 p-3 text-sm shadow-sm">
            <p className="text-ink-500">{t("imageUi.finalDimensions")}</p>
            <p className="mt-1 font-semibold text-ink-900">{layout ? `${layout.width} x ${layout.height}px` : "-"}</p>
          </div>

          <div className="grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
            <OutputFormatSelector
              description={t(formatDescKeys[outputFormat])}
              formats={outputFormats}
              getLabel={getImageFormatLabel}
              label={t("imageUi.finalFormat")}
              value={outputFormat}
              onChange={(format) => {
                setOutputFormat(format);
                resetFeedback();
              }}
            />

            {shouldShowQuality ? (
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                {t("imageUi.qualityLabel", { format: getImageFormatLabel(outputFormat), percent: qualityPercent })}
                <input
                  className="w-full accent-accent-cyan"
                  min={10}
                  max={100}
                  step={1}
                  type="range"
                  value={qualityPercent}
                  onChange={(event) => {
                    setQualityPercent(Number(event.target.value));
                    resetFeedback();
                  }}
                />
              </label>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            {t("imageUi.outputName")}
            <input
              className={cn(inputClassName, "w-full")}
              value={outputFileName}
              placeholder={defaultOutputBaseName}
              onChange={(event) => {
                setOutputFileName(event.target.value);
                setHasCustomOutputFileName(true);
                resetFeedback();
              }}
            />
            <span className="text-xs font-normal leading-5 text-ink-500">{t("imageUi.willPrepareAs", { name: finalOutputFileName })}</span>
          </label>

          {status === "processing" ? (
            <p className="flex items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm text-ink-600 shadow-sm">
              <Loader2 className="animate-spin text-accent-teal" size={16} />
              {labels.processing}
            </p>
          ) : null}

          {result ? (
            <div className="grid gap-3 rounded-lg border border-accent-teal/25 bg-accent-teal/10 p-3 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{labels.downloadReady}</p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalDimensions")}</dt>
                  <dd className="font-semibold text-ink-900">
                    {result.width} x {result.height}px
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalFormat")}</dt>
                  <dd className="font-semibold text-ink-900">{getImageFormatLabel(result.format)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">{t("imageUi.finalSize")}</dt>
                  <dd className="font-semibold text-ink-900">{formatFileSize(result.size)}</dd>
                </div>
              </dl>
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadResult}>
                <Download size={16} />
                {t("imageUi.downloadImage")}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-2 pt-1">
            <Button type="button" className="gap-2" onClick={() => void joinImages()} disabled={!canJoin}>
              {status === "processing" ? <Loader2 className="animate-spin" size={16} /> : <Images size={16} />}
              {labels.joinCta}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {labels.addImages}
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={clearSelection} disabled={items.length === 0 && status === "idle"}>
              <RotateCcw size={16} />
              {t("toolUi.clear")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
