import { ArrowRight, Braces, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ClientOnly } from "vite-react-ssg";
import { routePaths } from "../../app/routes/routePaths";
import { categories } from "../../config/categories";
import { RecentToolsSection } from "../../features/tools/components/RecentToolsSection";
import { tools } from "../../features/tools/data/tools";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { PageHead } from "../../shared/seo/PageHead";

const principles = [
  {
    icon: ShieldCheck,
    title: "Gratis y sin cuenta",
    description: "Usa las herramientas públicas sin registro, pagos ni instalación.",
  },
  {
    icon: Braces,
    title: "Documentado e integrable",
    description: "Cada herramienta tiene documentación y, en muchas, código que copiás a tu proyecto.",
  },
  {
    icon: Zap,
    title: "Favoritos y recientes",
    description: "Guarda accesos locales para volver rápido a tus herramientas usadas.",
  },
];

export function HomePage() {
  const integrableToolsCount = tools.filter((tool) => tool.integrableCode).length;

  return (
    <>
      <PageHead
        bareTitle
        title="Modulaq - Herramientas PDF, QR y texto en tu navegador"
        description="Modulaq ofrece herramientas gratuitas para PDF, QR y texto. Funcionan en tu navegador, sin cuenta y sin subir tus archivos."
        path="/"
      />
      <section className="relative overflow-hidden border-b border-surface-200/70 bg-gradient-to-b from-surface-50/60 via-surface-50/20 to-surface-100/30">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(22,174,189,0.14),transparent_64%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface-100/90 to-transparent"
        />
        <Container className="relative grid gap-12 py-16 md:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="lg:py-6">
            <HeroBadge icon={Sparkles} className="mb-5">
              Beta pública · {tools.length} herramientas
            </HeroBadge>
            <h1 className="max-w-3xl text-5xl font-semibold leading-none text-ink-900 md:text-6xl lg:text-7xl">
              Modulaq
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-ink-900 lg:text-2xl lg:leading-9">
              Microherramientas digitales que funcionan en tu navegador.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-500">
              {tools.length} herramientas gratis para PDF, QR y texto. Úsalas sin cuenta, sin instalar nada y con
              resultados listos para descargar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={routePaths.tools}>
                Explorar herramientas
                <ArrowRight className="ml-2" size={17} />
              </Button>
              <Button href={routePaths.consultations} variant="secondary">
                Enviar consulta o feedback
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:pl-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-surface-200/75 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
                <span className="text-3xl font-semibold text-ink-900">{tools.length}</span>
                <p className="mt-1 text-sm text-ink-500">herramientas gratis</p>
              </div>
              <div className="rounded-xl border border-surface-200/75 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
                <span className="text-3xl font-semibold text-ink-900">{categories.length}</span>
                <p className="mt-1 text-sm text-ink-500">categorías</p>
              </div>
              <div className="rounded-xl border border-surface-200/75 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
                <span className="text-3xl font-semibold text-ink-900">{integrableToolsCount}</span>
                <p className="mt-1 text-sm text-ink-500">con código integrable</p>
              </div>
              <div className="rounded-xl border border-ink-700/25 bg-gradient-to-br from-ink-900 to-ink-700 p-4 text-surface-50 shadow-panel ring-1 ring-surface-50/20">
                <span className="text-3xl font-semibold">0</span>
                <p className="mt-1 text-sm text-surface-200">archivos subidos</p>
              </div>
            </div>
            <div className="rounded-xl border border-accent-cyan/20 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
              <div className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-accent-cyan/20 bg-accent-cyan/10 text-accent-teal">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Procesamiento local</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink-500">
                    En las herramientas de archivos, el procesamiento ocurre en tu navegador; no subimos esos archivos a
                    Modulaq.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ClientOnly>{() => <RecentToolsSection />}</ClientOnly>

      <section className="border-t border-surface-50/80 bg-gradient-to-b from-surface-100/40 to-transparent">
        <Container className="py-14">
          <div className="w-full">
            <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700">
              Por qué Modulaq
            </p>
            <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">
              Útil, rápido y listo para integrar
            </h2>
            <p className="mt-2 w-full text-base leading-7 text-ink-500">
              Cada herramienta resuelve una tarea concreta, funciona sin instalar nada y guarda tus favoritos y
              recientes para volver rápido.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="group rounded-xl border border-surface-200/85 bg-gradient-to-br from-surface-50/95 to-surface-100/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:from-surface-50 hover:to-surface-50/90 hover:shadow-panel"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-surface-200/70 bg-surface-50 text-accent-teal shadow-sm transition group-hover:border-accent-cyan/30 group-hover:bg-accent-cyan/10">
                    <Icon size={19} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{principle.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
