import { ArrowRight, Blocks, Braces, Layers3, Zap } from "lucide-react";
import { ClientOnly } from "vite-react-ssg";
import { routePaths } from "../../app/routes/routePaths";
import { categories } from "../../config/categories";
import { RecentToolsSection } from "../../features/tools/components/RecentToolsSection";
import { tools } from "../../features/tools/data/tools";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { PageHead } from "../../shared/seo/PageHead";

const principles = [
  {
    icon: Layers3,
    title: "Modular",
    description: "Cada herramienta nace con una responsabilidad clara y una estructura reutilizable.",
  },
  {
    icon: Zap,
    title: "Rápido",
    description: "La experiencia inicial prioriza utilidad directa, poca fricción y navegación simple.",
  },
  {
    icon: Braces,
    title: "Integrable",
    description: "La base queda preparada para código reutilizable, documentación y APIs futuras.",
  },
];

export function HomePage() {
  const plannedToolsCount = tools.filter((tool) => tool.status === "planned").length;

  return (
    <>
      <PageHead
        bareTitle
        title="Modulaq — Microherramientas digitales modulares"
        description="Modulaq es una plataforma frontend-only de microherramientas digitales: unir y dividir PDFs, generar QR, limpiar texto y más, directo en tu navegador."
        path="/"
      />
      <section className="border-b border-surface-200/70">
        <Container className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-surface-200 bg-surface-50/80 px-3 py-2 text-sm font-semibold text-ink-700">
              <Blocks size={16} />
              V1.1 beta
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink-900 lg:text-6xl">
              Modulaq
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-500">
              Modulaq es una plataforma frontend-only de microherramientas digitales modulares. Código integrable,
              API y documentación forman parte de próximas etapas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={routePaths.tools}>
                Explorar herramientas
                <ArrowRight className="ml-2" size={17} />
              </Button>
              <Button href={routePaths.requestTool} variant="secondary">
                Solicitar herramienta
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50/82 p-5 shadow-panel">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-100 p-4">
                <span className="text-3xl font-semibold text-ink-900">{tools.length}</span>
                <p className="mt-1 text-sm text-ink-500">herramientas iniciales</p>
              </div>
              <div className="rounded-lg bg-surface-100 p-4">
                <span className="text-3xl font-semibold text-ink-900">{categories.length}</span>
                <p className="mt-1 text-sm text-ink-500">categorías base</p>
              </div>
              <div className="rounded-lg bg-surface-100 p-4">
                <span className="text-3xl font-semibold text-ink-900">{plannedToolsCount}</span>
                <p className="mt-1 text-sm text-ink-500">herramientas planificadas</p>
              </div>
              <div className="rounded-lg bg-ink-900 p-4 text-surface-50">
                <span className="text-3xl font-semibold">0</span>
                <p className="mt-1 text-sm text-surface-200">backends creados</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
              <p className="text-sm font-semibold text-ink-900">Procesamiento local</p>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Las herramientas actuales procesan los archivos directamente en tu navegador. En esta versión, los
                archivos no se suben a servidores de Modulaq para ser procesados.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <ClientOnly>{() => <RecentToolsSection />}</ClientOnly>

      <section>
        <Container className="py-12">
          <div className="w-full">
            <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700">
              Base fundacional
            </p>
            <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">
              Diseñada para crecer sin volverse pesada
            </h2>
            <p className="mt-2 w-full text-base leading-7 text-ink-500 xl:whitespace-nowrap">
              La primera versión establece el sistema visual, la navegación y la arquitectura de catálogo para que cada herramienta futura encaje en el mismo ecosistema.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article key={principle.title} className="rounded-lg border border-surface-200 bg-surface-50/78 p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-surface-200 text-ink-900">
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
