import { localizedPath } from "../shared/i18n/paths";
import type { Language } from "../shared/i18n/types";
import type { TranslationKey } from "../shared/i18n/dictionaries/es";
import type { StaticRouteKey } from "../shared/i18n/paths";

type NavigationItem = {
  /** Clave i18n para el label visible. */
  labelKey: TranslationKey;
  /** Clave de ruta estática para resolver el path por idioma. */
  routeKey: StaticRouteKey;
};

export const navigationItems: NavigationItem[] = [
  { labelKey: "nav.tools", routeKey: "tools" },
  { labelKey: "nav.consultations", routeKey: "consultations" },
];

export function resolveNavPath(item: NavigationItem, language: Language) {
  return localizedPath(item.routeKey, language);
}
