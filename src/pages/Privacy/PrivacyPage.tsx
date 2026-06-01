import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routePaths } from "../../app/routes/routePaths";
import { CONTACT_EMAIL } from "../../config/contact";
import { Container } from "../../shared/components/Container";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { PageHead } from "../../shared/seo/PageHead";

function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-surface-200 bg-surface-50/82 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-ink-500">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <Container className="py-10 md:py-12">
      <PageHead
        title="Privacidad"
        description="Cómo trata Modulaq tus datos: los archivos se procesan localmente en tu navegador, las métricas son anónimas y sin cookies, y las consultas se envían vía Web3Forms. Sin cuentas ni venta de datos."
        path="/privacidad"
      />

      <SectionHeader
        eyebrow="Privacidad"
        headingLevel="h1"
        title="Privacidad en Modulaq"
        description="Modulaq está pensado para ser privado por defecto. Esta página explica, en lenguaje simple, qué pasa con tus datos al usar el sitio."
      />

      <div className="mt-6 grid gap-4">
        <PrivacySection title="Resumen">
          <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
            <li>Priorizamos el procesamiento local: tus archivos se procesan en tu navegador.</li>
            <li>En la versión actual no hay cuentas ni inicio de sesión.</li>
            <li>No vendemos datos.</li>
            <li>No usamos cookies propias.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Procesamiento local de archivos">
          <p>
            En las herramientas de archivos disponibles, el procesamiento ocurre dentro de tu navegador cuando la
            herramienta lo permite. No subimos esos archivos a Modulaq para realizar esas operaciones.
          </p>
          <p>
            Para procesar esos archivos, algunas herramientas usan librerías de código abierto que se ejecutan también
            dentro de tu navegador (por ejemplo, para leer o generar PDFs e imágenes).
          </p>
        </PrivacySection>

        <PrivacySection title="Favoritos e historial local">
          <p>
            Tus favoritos y las herramientas usadas recientemente se guardan en el{" "}
            <span className="font-medium text-ink-700">localStorage</span> de tu navegador.
          </p>
          <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
            <li>Incluyen solo identificadores de herramientas (ids/slugs), no contenido de tus archivos.</li>
            <li>No se sincronizan entre dispositivos.</li>
            <li>Podés borrarlos limpiando los datos del sitio en tu navegador.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Consultas">
          <p>
            El formulario de la página de consultas usa{" "}
            <span className="font-medium text-ink-700">Web3Forms</span> para enviarnos tu mensaje. Si enviás una
            consulta, Web3Forms recibe los datos que escribiste en el formulario y nos los hace llegar.
          </p>
          <p>
            Usá ese canal solo para lo que quieras compartir con nosotros. Para cualquier duda, podés escribirnos a{" "}
            <a className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </PrivacySection>

        <PrivacySection title="Analítica">
          <p>
            Usamos Cloudflare Web Analytics para entender, de forma agregada y anónima, las visitas, las rutas más
            usadas y el rendimiento general del sitio.
          </p>
          <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
            <li>No usamos cookies para la analítica.</li>
            <li>No medimos nombres de archivos, contenido de PDFs o textos, emails ni mensajes de consultas.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Código integrable">
          <p>
            Los snippets de código integrable son contenido documental para que los copies y uses bajo tu
            responsabilidad. No ejecutan nada por sí solos: recién corren cuando los copiás y los usás en tu propio
            proyecto.
          </p>
        </PrivacySection>

        <PrivacySection title="Límites">
          <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
            <li>Algunas herramientas pueden usar memoria y CPU de tu navegador.</li>
            <li>Los archivos grandes pueden tardar o fallar según tu equipo.</li>
            <li>Los PDFs protegidos o con estructuras incompatibles pueden no procesarse.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Contacto">
          <p>
            Para consultas o solicitudes, escribinos a{" "}
            <a className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            o usá la{" "}
            <Link className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" to={routePaths.consultations}>
              página de consultas
            </Link>
            .
          </p>
        </PrivacySection>
      </div>
    </Container>
  );
}
