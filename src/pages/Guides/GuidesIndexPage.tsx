import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getGuidesByLanguage } from "../../features/guides/utils/getGuides";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";
import { PageHead } from "../../shared/seo/PageHead";

export function GuidesIndexPage() {
  const { language, t } = useI18n();
  const path = localizedPath("guides", language);
  const guides = getGuidesByLanguage(language);

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-10 md:py-12">
        <PageHead title={t("guides.head.title")} description={t("guides.head.description")} path={path} />

        <HeroPanel>
          <HeroBadge icon={BookOpen}>{t("guides.hero.badge")}</HeroBadge>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            {t("guides.hero.h1")}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-ink-500">{t("guides.hero.description")}</p>
        </HeroPanel>

        {guides.length === 0 ? (
          <p className="mt-8 rounded-xl border border-surface-200/80 bg-surface-50/90 p-6 text-sm text-ink-500">
            {t("guides.index.empty")}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                to={`${path}/${guide.slug}`}
                className="group flex flex-col rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/45 p-5 shadow-panel ring-1 ring-surface-50/80 backdrop-blur transition hover:border-accent-cyan/40 hover:to-surface-100/70"
              >
                <h2 className="text-lg font-semibold leading-snug text-ink-900">{guide.h1}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{guide.lead}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-teal">
                  {t("guides.index.readGuide")}
                  <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
