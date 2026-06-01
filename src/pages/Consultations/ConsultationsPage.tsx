import { Mail } from "lucide-react";
import type { ContactType } from "../../features/contact/components/ContactForm";
import { ContactForm } from "../../features/contact/components/ContactForm";
import { Container } from "../../shared/components/Container";
import { PageHead } from "../../shared/seo/PageHead";

type ConsultationsPageProps = {
  initialType: ContactType;
};

export function ConsultationsPage({ initialType }: ConsultationsPageProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(22,174,189,0.13),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(116,103,201,0.07),transparent_38rem)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(189,206,219,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(189,206,219,0.05)_1px,transparent_1px)] bg-[size:88px_88px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.45),transparent_72%)]"
      />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title="Consultas"
          description="Solicitá una herramienta, reportá un problema o enviá tu consulta al equipo de Modulaq."
          path="/consultas"
        />
        <section className="relative overflow-hidden rounded-2xl border border-surface-200/70 bg-gradient-to-br from-surface-50/90 via-surface-50/75 to-surface-100/60 p-5 shadow-soft ring-1 ring-surface-50/80 backdrop-blur md:p-6">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />
          <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-surface-200/80 bg-surface-50/80 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700 shadow-sm">
            <Mail size={15} />
            Contacto
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            Consultas, ideas y reportes
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-ink-500">
            Elegí el tipo de mensaje y contanos qué necesitás revisar, proponer o reportar.
          </p>
        </section>

        <div className="mt-6">
          <ContactForm initialType={initialType} />
        </div>
      </Container>
    </section>
  );
}
