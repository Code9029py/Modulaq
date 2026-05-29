import { Star } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { useFavorites } from "../context/ToolPrefsProvider";

type FavoriteToggleButtonProps = {
  toolId: string;
  toolName: string;
  className?: string;
};

export function FavoriteToggleButton({ toolId, toolName, className }: FavoriteToggleButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(toolId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${toolName} de favoritos` : `Agregar ${toolName} a favoritos`}
      title={active ? "Quitar de favoritos" : "Agregar a favoritos"}
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
