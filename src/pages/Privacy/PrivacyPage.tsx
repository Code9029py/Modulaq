import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, BarChart3, Code2, Cookie, HardDrive, MessageSquare, ShieldCheck } from "lucide-react";
import { CONTACT_EMAIL } from "../../config/contact";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { TextLink } from "../../shared/components/TextLink";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localizedPath } from "../../shared/i18n/paths";
import { PageHead } from "../../shared/seo/PageHead";

function SummaryItem({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <article className="rounded-xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-sm ring-1 ring-surface-50/70 backdrop-blur">
      <div className="flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-accent-cyan/20 bg-accent-cyan/10 text-accent-teal">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-ink-500">{children}</p>
        </div>
      </div>
    </article>
  );
}

function TopicGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-surface-200/70 pt-8 lg:grid-cols-[230px_1fr] lg:gap-6">
      <div className="rounded-xl border-l-2 border-accent-cyan/35 bg-surface-50/50 py-3 pl-4 pr-3">
        <h2 className="text-xl font-semibold leading-tight text-ink-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function DetailCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <article className="rounded-xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/45 p-5 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-surface-200/80 bg-surface-50 text-accent-teal shadow-sm">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-ink-500">{children}</div>
        </div>
      </div>
    </article>
  );
}

export function PrivacyPage() {
  const { language, t } = useI18n();
  const path = localizedPath("privacy", language);

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title={t("privacy.head.title")}
          description={t("privacy.head.description")}
          path={path}
        />

        <HeroPanel>
          <HeroBadge icon={ShieldCheck}>{t("privacy.hero.badge")}</HeroBadge>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            {t("privacy.hero.h1")}
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-ink-500">{t("privacy.hero.description")}</p>
        </HeroPanel>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem icon={HardDrive} title={t("privacy.summary.localTitle")}>
            {t("privacy.summary.localBody")}
          </SummaryItem>
          <SummaryItem icon={ShieldCheck} title={t("privacy.summary.noAccountsTitle")}>
            {t("privacy.summary.noAccountsBody")}
          </SummaryItem>
          <SummaryItem icon={Cookie} title={t("privacy.summary.noCookiesTitle")}>
            {t("privacy.summary.noCookiesBody")}
          </SummaryItem>
          <SummaryItem icon={BarChart3} title={t("privacy.summary.noSellTitle")}>
            {t("privacy.summary.noSellBody")}
          </SummaryItem>
        </section>

        <div className="mt-10 grid gap-10">
          <TopicGroup title={t("privacy.group.dataTitle")} description={t("privacy.group.dataDescription")}>
            <DetailCard icon={HardDrive} title={t("privacy.card.localFilesTitle")}>
              <p>{t("privacy.card.localFilesP1")}</p>
              <p>{t("privacy.card.localFilesP2")}</p>
            </DetailCard>

            <DetailCard icon={ShieldCheck} title={t("privacy.card.localStorageTitle")}>
              <p>
                {t("privacy.card.localStorageP1Pre")}{" "}
                <span className="font-medium text-ink-700">localStorage</span>
                {t("privacy.card.localStorageP1Post")}
              </p>
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>{t("privacy.card.localStorageItem1")}</li>
                <li>{t("privacy.card.localStorageItem2")}</li>
                <li>{t("privacy.card.localStorageItem3")}</li>
                <li>{t("privacy.card.localStorageItem4")}</li>
              </ul>
            </DetailCard>
          </TopicGroup>

          <TopicGroup title={t("privacy.group.commsTitle")} description={t("privacy.group.commsDescription")}>
            <DetailCard icon={MessageSquare} title={t("privacy.card.consultationsTitle")}>
              <p>
                {t("privacy.card.consultationsP1Pre")}{" "}
                <span className="font-medium text-ink-700">Web3Forms</span>{" "}
                {t("privacy.card.consultationsP1Post")}
              </p>
              <p>
                {t("privacy.card.consultationsP2Pre")}{" "}
                <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>
                {t("privacy.card.consultationsP2Post")}
              </p>
            </DetailCard>

            <DetailCard icon={BarChart3} title={t("privacy.card.analyticsTitle")}>
              <p>{t("privacy.card.analyticsP1")}</p>
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>{t("privacy.card.analyticsItem1")}</li>
                <li>{t("privacy.card.analyticsItem2")}</li>
              </ul>
            </DetailCard>
          </TopicGroup>

          <TopicGroup title={t("privacy.group.advancedTitle")} description={t("privacy.group.advancedDescription")}>
            <DetailCard icon={Code2} title={t("privacy.card.integrableTitle")}>
              <p>{t("privacy.card.integrableP1")}</p>
            </DetailCard>

            <DetailCard icon={AlertTriangle} title={t("privacy.card.limitsTitle")}>
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>{t("privacy.card.limitsItem1")}</li>
                <li>{t("privacy.card.limitsItem2")}</li>
                <li>{t("privacy.card.limitsItem3")}</li>
              </ul>
            </DetailCard>
          </TopicGroup>
        </div>
      </Container>
    </section>
  );
}
