import { Boxes, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { routePaths } from "../routes/routePaths";
import { navigationItems } from "../../config/navigation";
import { Container } from "../../shared/components/Container";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-surface-200/80 bg-surface-50/88 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <NavLink to={routePaths.home} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-surface-50 shadow-soft">
            <Boxes size={19} />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight text-ink-900">Modulaq</span>
            <span className="block text-xs text-ink-500">microherramientas modulares</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-surface-200 text-ink-900"
                    : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-surface-200 bg-surface-100 text-ink-700 lg:hidden"
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
          title={isMobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <Menu size={19} />
        </button>
      </Container>

      {isMobileMenuOpen ? (
        <Container className="border-t border-surface-200 py-3 lg:hidden">
          <nav id="mobile-navigation" className="grid gap-1" aria-label="Navegación principal">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
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
                {item.label}
              </NavLink>
            ))}
          </nav>
        </Container>
      ) : null}
    </header>
  );
}
