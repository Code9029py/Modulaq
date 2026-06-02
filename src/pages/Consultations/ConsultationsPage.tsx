import { Mail } from "lucide-react";
import type { ContactType } from "../../features/contact/components/ContactForm";
import { ContactForm } from "../../features/contact/components/ContactForm";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { PageHead } from "../../shared/seo/PageHead";

type ConsultationsPageProps = {
  initialType: ContactType;
};

export function ConsultationsPage({ initialType }: ConsultationsPageProps) {
  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title="Consultas"
          description="Solicitá una herramienta, reportá un problema o enviá tu consulta al equipo de Modulaq."
          path="/consultas"
        />
        <HeroPanel>
          <HeroBadge icon={Mail}>Contacto</HeroBadge>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            Consultas, ideas y reportes
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-ink-500">
            Elegí el tipo de mensaje y contanos qué necesitás revisar, proponer o reportar.
          </p>
        </HeroPanel>

        <div className="mt-6">
          <ContactForm initialType={initialType} />
        </div>
      </Container>
    </section>
  );
}
