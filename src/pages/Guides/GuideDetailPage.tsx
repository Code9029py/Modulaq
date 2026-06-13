import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getToolById } from "../../features/tools/utils/getToolById";
import { localizeTool } from "../../features/tools/utils/localizeTool";
import { getGuideBySlug } from "../../features/guides/utils/getGuides";
import type { GuideBlock } from "../../features/guides/types/guide.types";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { buildToolPathFor, localizedPath } from "../../shared/i18n/paths";
import { PageHead } from "../../shared/seo/PageHead";

function BlockContent({ block }: { block: GuideBlock }) {
  if (block.kind === "p") {
    return <p className="text-sm leading-7 text-ink-700">{block.text}</p>;
  }
  if (block.kind === "steps") {
    return (
      <ol className="grid list-decimal gap-2 pl-5 text-sm leading-7 text-ink-700 marker:font-semibold marker:text-ink-500">
        {block.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="grid list-disc gap-2 pl-5 text-sm leading-7 text-ink-700 marker:text-ink-300">
      {block.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function GuideDetailPage() {
  const { slug } = useParams();
  const { language, t } = useI18n();
  const guide = getGuideBySlug(slug);
  const guidesPath = localizedPath("guides", language);

  // El detalle es single-language: una guía sólo se sirve bajo su propio
  // idioma. Acceder a una guía ES bajo /en/guides (o viceversa) cae a noindex.
  if (!guide || guide.language !== language) {
    return (
      <section className="relative overflow-hidden">
        <PageBackdrop tone="cyan-violet" />
        <Container className="relative py-16">
          <PageHead
            noindex
            singleLanguage
            title={t("guides.head.title")}
            description={t("guides.head.description")}
            path={guidesPath}
          />
          <HeroPanel className="p-8">
            <HeroBadge icon={BookOpen}>{t("guides.hero.badge")}</HeroBadge>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">{t("guides.hero.h1")}</h1>
            <div className="mt-6">
              <Button href={guidesPath}>{t("guides.detail.back")}</Button>
            </div>
          </HeroPanel>
        </Container>
      </section>
    );
  }

  const primaryDefinition = getToolById(guide.primaryToolId);
  const primaryTool = primaryDefinition ? localizeTool(primaryDefinition, language) : null;
  const relatedTools = guide.relatedToolIds
    .map((id) => getToolById(id))
    .filter((def): def is NonNullable<typeof def> => Boolean(def))
    .map((def) => localizeTool(def, language));

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-8 md:py-10">
        <PageHead
          singleLanguage
          title={guide.seoTitle}
          description={guide.seoDescription}
          path={`${guidesPath}/${guide.slug}`}
        />

        <Link
          to={guidesPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-ink-900"
        >
          <ArrowLeft size={16} />
          {t("guides.detail.back")}
        </Link>

        <article className="mt-3">
          <HeroPanel className="p-5 md:p-6">
            <HeroBadge icon={BookOpen}>{t("guides.hero.badge")}</HeroBadge>
            <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-ink-900 md:text-3xl">
              {guide.h1}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-ink-500">{guide.lead}</p>
            {primaryTool ? (
              <div className="mt-5">
                <Button href={buildToolPathFor(primaryTool, language)} className="gap-2">
                  {t("guides.detail.useTool", { tool: primaryTool.name })}
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : null}
          </HeroPanel>

          <div className="mt-6 grid gap-6">
            {guide.sections.map((section, index) => (
              <section
                key={index}
                className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-5 shadow-sm ring-1 ring-surface-50/80 backdrop-blur md:p-6"
              >
                <h2 className="text-lg font-semibold text-ink-900">{section.heading}</h2>
                <div className="mt-3 grid gap-3">
                  {section.blocks.map((block, blockIndex) => (
                    <BlockContent key={blockIndex} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-6 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/10 p-5 text-sm leading-7 text-ink-700 md:p-6">
            {guide.conclusion}
          </p>

          {relatedTools.length > 0 ? (
            <section className="mt-6 rounded-2xl border border-surface-200/80 bg-surface-50/90 p-5 shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
              <h2 className="text-sm font-semibold text-ink-900">{t("guides.detail.related")}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={buildToolPathFor(tool, language)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:border-accent-cyan/35 hover:bg-surface-50 hover:text-ink-900"
                  >
                    {tool.name}
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </Container>
    </section>
  );
}
