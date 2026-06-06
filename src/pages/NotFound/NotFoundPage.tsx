import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";
import { PageHead } from "../../shared/seo/PageHead";

export function NotFoundPage() {
  const { language, t } = useI18n();
  const homePath = localizedPath("home", language);

  return (
    <Container className="py-16">
      <PageHead
        noindex
        title={t("notFound.head.title")}
        description={t("notFound.head.description")}
        path="/404"
      />
      <div className="rounded-lg border border-surface-200 bg-surface-50/78 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-700">{t("notFound.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">{t("notFound.h1")}</h1>
        <p className="mt-3 max-w-xl text-ink-500">{t("notFound.body")}</p>
        <div className="mt-6">
          <Button href={homePath}>{t("notFound.cta")}</Button>
        </div>
      </div>
    </Container>
  );
}
