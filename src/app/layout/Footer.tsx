import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/contact";
import { routePaths } from "../routes/routePaths";
import { Container } from "../../shared/components/Container";
import { siteConfig } from "../../shared/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-surface-200/80 bg-surface-100/70">
      <Container className="grid gap-6 py-8 text-sm text-ink-500 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-semibold text-ink-900">© 2026 {siteConfig.name}</p>
          <p className="mt-1">Herramientas PDF, QR y texto para usar en el navegador.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to={routePaths.privacy} className="hover:text-ink-900">
            Privacidad
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink-900">
            {CONTACT_EMAIL}
          </a>
        </div>
      </Container>
    </footer>
  );
}
