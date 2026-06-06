import { Globe } from "lucide-react";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { SUPPORTED_LANGUAGES, type Language } from "../../shared/i18n/types";
import { cn } from "../../shared/utils/cn";

const LABELS: Record<Language, string> = {
  es: "ES",
  en: "EN",
};

const FULL_LABELS: Record<Language, string> = {
  es: "Español",
  en: "English",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("nav.languageSwitch")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-surface-200/80 bg-surface-50/90 p-0.5 text-xs font-semibold shadow-sm",
        className,
      )}
    >
      <Globe size={14} className="mx-1 hidden text-ink-500 sm:block" aria-hidden="true" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang;
        return (
          <button
            key={lang}
            type="button"
            aria-pressed={isActive}
            aria-label={FULL_LABELS[lang]}
            onClick={() => setLanguage(lang)}
            className={cn(
              "min-h-7 rounded-[5px] px-2 py-1 transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
              isActive
                ? "bg-ink-900 text-surface-50"
                : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
            )}
          >
            {LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
