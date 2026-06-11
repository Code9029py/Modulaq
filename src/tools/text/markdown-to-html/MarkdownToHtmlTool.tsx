import { Clipboard, Download, Eye, FileCode, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import {
  DEFAULT_OUTPUT_BASE_NAME,
  MAX_MARKDOWN_LENGTH,
  markdownToHtml,
} from "./markdownToHtml.service";

const inputClassName =
  "min-h-11 w-full rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

const textareaClassName =
  "min-h-72 w-full resize-y rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/25";

type OutputMode = "fragment" | "document";
type ResultTab = "preview" | "code";

const sampleMarkdown = `# Hola Modulaq\n\nEste es un **párrafo** con un [enlace](https://modulaq.dev) y \`código inline\`.\n\n- ítem 1\n- ítem 2\n\n> Bloque de cita.\n\n\`\`\`ts\nconst x = 1;\n\`\`\`\n`;

export function MarkdownToHtmlTool() {
  const { t } = useI18n();
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [mode, setMode] = useState<OutputMode>("fragment");
  const [title, setTitle] = useState("");
  const [outputBaseName, setOutputBaseName] = useState(DEFAULT_OUTPUT_BASE_NAME);
  const [resultTab, setResultTab] = useState<ResultTab>("preview");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const overLimit = markdown.length > MAX_MARKDOWN_LENGTH;
  const safeMarkdown = overLimit ? markdown.slice(0, MAX_MARKDOWN_LENGTH) : markdown;

  const result = useMemo(
    () =>
      markdownToHtml(safeMarkdown, {
        document: mode === "document",
        title: title.trim() || undefined,
      }),
    [safeMarkdown, mode, title],
  );

  const finalOutputFileName = buildDownloadFileName(outputBaseName, "html", DEFAULT_OUTPUT_BASE_NAME);

  const copyHtml = async () => {
    if (!result.html) return;
    try {
      await navigator.clipboard.writeText(result.html);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const downloadHtml = () => {
    if (!result.html) return;
    const blob = new Blob([result.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalOutputFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setMarkdown("");
    setTitle("");
    setOutputBaseName(DEFAULT_OUTPUT_BASE_NAME);
    setCopyStatus("idle");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.6fr)]">
      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{t("tools.markdown-to-html.ui.inputTitle")}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-500">{t("tools.markdown-to-html.ui.inputIntro")}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            <span className="flex items-baseline justify-between gap-2">
              <span>{t("tools.markdown-to-html.ui.markdownLabel")}</span>
              <span className={cn("text-xs font-normal", overLimit ? "text-accent-violet" : "text-ink-500")}>
                {t("tools.markdown-to-html.ui.charCount", { count: markdown.length, limit: MAX_MARKDOWN_LENGTH })}
              </span>
            </span>
            <textarea
              className={cn(textareaClassName, "min-h-[24rem] font-mono")}
              value={markdown}
              placeholder={t("tools.markdown-to-html.ui.markdownPlaceholder")}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck={false}
            />
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-ink-700">{t("tools.markdown-to-html.ui.modeLabel")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["fragment", "document"] as const).map((value) => {
                const isActive = mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMode(value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
                      isActive
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                        : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
                    )}
                  >
                    <span className="block">{t(`tools.markdown-to-html.ui.mode.${value}` as const)}</span>
                    <span className="mt-1 block text-xs font-normal text-ink-500">
                      {t(`tools.markdown-to-html.ui.modeDesc.${value}` as const)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {mode === "document" ? (
            <label className="grid gap-1.5 text-sm font-semibold text-ink-700">
              {t("tools.markdown-to-html.ui.titleLabel")}
              <input
                className={inputClassName}
                value={title}
                maxLength={120}
                placeholder={t("tools.markdown-to-html.ui.titlePlaceholder")}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          ) : null}

          {overLimit ? (
            <p className="rounded-md border border-accent-violet/20 bg-accent-violet/8 px-3 py-2 text-sm text-ink-600">
              {t("tools.markdown-to-html.ui.overLimit", { limit: MAX_MARKDOWN_LENGTH })}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAll} disabled={markdown.length === 0 && title.length === 0 && outputBaseName === DEFAULT_OUTPUT_BASE_NAME}>
              <RotateCcw size={16} />
              {t("toolUi.clearAll")}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t("tools.markdown-to-html.ui.outputTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-ink-500">{t("tools.markdown-to-html.ui.outputIntro")}</p>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-surface-200/80 bg-surface-50/80 p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={resultTab === "preview"}
              onClick={() => setResultTab("preview")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
                resultTab === "preview"
                  ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                  : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
              )}
            >
              <Eye size={14} />
              {t("tools.markdown-to-html.ui.tabPreview")}
            </button>
            <button
              type="button"
              aria-pressed={resultTab === "code"}
              onClick={() => setResultTab("code")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
                resultTab === "code"
                  ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                  : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
              )}
            >
              <FileCode size={14} />
              {t("tools.markdown-to-html.ui.tabCode")}
            </button>
          </div>

          {resultTab === "preview" ? (
            <div
              className="prose-modulaq min-h-[18rem] max-h-[28rem] overflow-auto rounded-lg border border-surface-200/80 bg-surface-50 p-4 text-sm text-ink-900"
              dangerouslySetInnerHTML={{ __html: result.isDocument ? result.html.replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, "") : result.html }}
            />
          ) : (
            <pre className="min-h-[18rem] max-h-[28rem] overflow-auto rounded-lg border border-surface-200/80 bg-surface-100/60 p-4 text-xs leading-5 text-ink-900">
              <code>{result.html || t("tools.markdown-to-html.ui.emptyOutput")}</code>
            </pre>
          )}

          <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
            {t("toolUi.outputNameDownload")}
            <input
              className={inputClassName}
              value={outputBaseName}
              placeholder={DEFAULT_OUTPUT_BASE_NAME}
              onChange={(event) => setOutputBaseName(event.target.value)}
            />
            <span className="text-xs font-normal text-ink-500">{t("toolUi.downloadAs", { name: finalOutputFileName })}</span>
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={() => void copyHtml()} disabled={!result.html}>
              <Clipboard size={16} />
              {copyStatus === "copied" ? t("toolUi.copied") : t("tools.markdown-to-html.ui.copyHtml")}
            </Button>
            <Button type="button" className="gap-2" onClick={downloadHtml} disabled={!result.html}>
              <Download size={16} />
              {t("tools.markdown-to-html.ui.downloadHtml")}
            </Button>
          </div>

          {copyStatus === "error" ? (
            <p className="text-xs text-ink-600">{t("tools.markdown-to-html.ui.copyFailed")}</p>
          ) : null}
        </div>

        <p className="mt-3 text-xs leading-5 text-ink-500">{t("tools.markdown-to-html.ui.previewNote")}</p>
      </section>
    </div>
  );
}
