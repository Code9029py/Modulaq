import type { ContactType } from "../../features/contact/components/ContactForm";
import { ContactForm } from "../../features/contact/components/ContactForm";
import { Container } from "../../shared/components/Container";
import { SectionHeader } from "../../shared/components/SectionHeader";

type ConsultationsPageProps = {
  initialType: ContactType;
};

export function ConsultationsPage({ initialType }: ConsultationsPageProps) {
  return (
    <Container className="py-8 md:py-9 lg:py-10">
      <SectionHeader
        eyebrow="Consultas"
        headingLevel="h1"
        title="Un canal para ideas, reportes y propuestas"
        description="Elegí el tipo de consulta y dejá preparado el mensaje. En esta V1 el formulario sigue siendo visual, sin envío real."
      />

      <div className="mt-6">
        <ContactForm initialType={initialType} />
      </div>
    </Container>
  );
}
