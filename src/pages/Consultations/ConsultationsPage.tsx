import type { ContactType } from "../../features/contact/components/ContactForm";
import { ContactForm } from "../../features/contact/components/ContactForm";
import { Container } from "../../shared/components/Container";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { PageHead } from "../../shared/seo/PageHead";

type ConsultationsPageProps = {
  initialType: ContactType;
};

export function ConsultationsPage({ initialType }: ConsultationsPageProps) {
  return (
    <Container className="py-8 md:py-9 lg:py-10">
      <PageHead
        title="Consultas"
        description="Solicitá una herramienta, reportá un problema o enviá tu consulta al equipo de Modulaq."
        path="/consultas"
      />
      <SectionHeader
        eyebrow="Consultas"
        headingLevel="h1"
        title="Un canal para ideas, reportes y feedback"
        description="Elegí el tipo de consulta y prepará tu mensaje para enviarlo desde tu aplicación de correo."
      />

      <div className="mt-6">
        <ContactForm initialType={initialType} />
      </div>
    </Container>
  );
}
