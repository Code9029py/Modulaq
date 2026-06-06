import { Star } from "lucide-react";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { cn } from "../../../shared/utils/cn";
import { useFavorites } from "../context/ToolPrefsProvider";

type FavoriteToggleButtonProps = {
  toolId: string;
  toolName: string;
  className?: string;
};

export function FavoriteToggleButton({ toolId, toolName, className }: FavoriteToggleButtonProps) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(toolId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? t("favorites.remove", { name: toolName }) : t("favorites.add", { name: toolName })}
      title={active ? t("favorites.removeShort") : t("favorites.addShort")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(toolId);
      }}
      className={cn(
        "inline-grid h-10 w-10 shrink-0 place-items-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
        active ? "text-accent-teal" : "text-ink-300 hover:bg-surface-100 hover:text-ink-700",
        className,
      )}
    >
      <Star size={18} className={cn(active && "fill-current")} />
    </button>
  );
}
