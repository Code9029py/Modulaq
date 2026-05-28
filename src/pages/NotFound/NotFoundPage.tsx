import { routePaths } from "../../app/routes/routePaths";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { PageHead } from "../../shared/seo/PageHead";

export function NotFoundPage() {
  return (
    <Container className="py-16">
      <PageHead
        noindex
        title="Página no encontrada"
        description="Esa ruta no forma parte de Modulaq. Volvé al inicio o explorá el catálogo de herramientas."
        path="/404"
      />
      <div className="rounded-lg border border-surface-200 bg-surface-50/78 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-700">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">Página no encontrada</h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Esa ruta no forma parte de la base inicial de Modulaq.
        </p>
        <div className="mt-6">
          <Button href={routePaths.home}>Volver al inicio</Button>
        </div>
      </div>
    </Container>
  );
}
