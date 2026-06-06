import { Boxes, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navigationItems, resolveNavPath } from "../../config/navigation";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";
import { Container } from "../../shared/components/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, t } = useI18n();
  const homePath = localizedPath("home", language);

  return (
    <header className="sticky top-0 z-20 border-b border-surface-200/80 bg-surface-50/88 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <NavLink to={homePath} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-surface-50 shadow-soft">
            <Boxes size={19} />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight text-ink-900">Modulaq</span>
            <span className="block text-xs text-ink-500">{t("nav.tagline")}</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <NavLink
                key={item.routeKey}
                to={resolveNavPath(item, language)}
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-surface-200 text-ink-900"
                      : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                  ].join(" ")
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <LanguageSwitcher className="hidden sm:inline-flex" />

          <button
            className="grid h-10 w-10 place-items-center rounded-md border border-surface-200 bg-surface-100 text-ink-700 lg:hidden"
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            title={isMobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <Menu size={19} />
          </button>
        </div>
      </Container>

      {isMobileMenuOpen ? (
        <Container className="border-t border-surface-200 py-3 lg:hidden">
          <nav id="mobile-navigation" className="grid gap-1" aria-label={t("nav.openMenu")}>
            {navigationItems.map((item) => (
              <NavLink
                key={item.routeKey}
                to={resolveNavPath(item, language)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-surface-200 text-ink-900"
                      : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                  ].join(" ")
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            <div className="mt-2 flex sm:hidden">
              <LanguageSwitcher />
            </div>
          </nav>
        </Container>
      ) : null}
    </header>
  );
}
