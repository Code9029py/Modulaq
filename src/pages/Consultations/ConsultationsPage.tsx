import { Mail } from "lucide-react";
import type { ContactType } from "../../features/contact/components/ContactForm";
import { ContactForm } from "../../features/contact/components/ContactForm";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";
import { PageHead } from "../../shared/seo/PageHead";

type ConsultationsPageProps = {
  initialType: ContactType;
};

export function ConsultationsPage({ initialType }: ConsultationsPageProps) {
  const { language, t } = useI18n();
  const path = localizedPath("consultations", language);

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title={t("consultations.head.title")}
          description={t("consultations.head.description")}
          path={path}
        />
        <HeroPanel>
          <HeroBadge icon={Mail}>{t("consultations.hero.badge")}</HeroBadge>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            {t("consultations.hero.h1")}
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-ink-500">
            {t("consultations.hero.description")}
          </p>
        </HeroPanel>

        <div className="mt-6">
          <ContactForm initialType={initialType} />
        </div>
      </Container>
    </section>
  );
}
