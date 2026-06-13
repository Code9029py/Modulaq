import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/contact";
import { Container } from "../../shared/components/Container";
import { siteConfig } from "../../shared/constants/site";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";

export function Footer() {
  const { language, t } = useI18n();
  const guidesPath = localizedPath("guides", language);
  const privacyPath = localizedPath("privacy", language);

  return (
    <footer className="border-t border-surface-200/80 bg-surface-100/70">
      <Container className="grid gap-6 py-8 text-sm text-ink-500 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-semibold text-ink-900">© 2026 {siteConfig.name}</p>
          <p className="mt-1">{t("footer.tagline")}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to={guidesPath} className="hover:text-ink-900">
            {t("footer.guides")}
          </Link>
          <Link to={privacyPath} className="hover:text-ink-900">
            {t("footer.privacy")}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink-900">
            {CONTACT_EMAIL}
          </a>
        </div>
      </Container>
    </footer>
  );
}
