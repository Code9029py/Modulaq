import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, BarChart3, Code2, Cookie, HardDrive, MessageSquare, ShieldCheck } from "lucide-react";
import { CONTACT_EMAIL } from "../../config/contact";
import { Container } from "../../shared/components/Container";
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
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(22,174,189,0.12),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(116,103,201,0.06),transparent_38rem)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(189,206,219,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(189,206,219,0.04)_1px,transparent_1px)] bg-[size:88px_88px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.38),transparent_72%)]"
      />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title="Privacidad"
          description="Cómo trata Modulaq tus datos: los archivos se procesan localmente en tu navegador, las métricas son anónimas y sin cookies, y las consultas se envían vía Web3Forms. Sin cuentas ni venta de datos."
          path="/privacidad"
        />

        <section className="relative overflow-hidden rounded-2xl border border-surface-200/70 bg-gradient-to-br from-surface-50/90 via-surface-50/75 to-surface-100/60 p-5 shadow-soft ring-1 ring-surface-50/80 backdrop-blur md:p-6">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />
          <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-surface-200/80 bg-surface-50/80 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700 shadow-sm">
            <ShieldCheck size={15} />
            Privacidad
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
            Privacidad en Modulaq
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-ink-500">
            Información clara sobre procesamiento local, analítica, consultas y datos guardados en tu navegador.
          </p>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem icon={HardDrive} title="Archivos en tu navegador">
            Las herramientas de archivos procesan localmente cuando la herramienta lo permite.
          </SummaryItem>
          <SummaryItem icon={ShieldCheck} title="Sin cuentas">
            En la versión actual no hay registro, login ni perfiles de usuario.
          </SummaryItem>
          <SummaryItem icon={Cookie} title="Sin cookies propias">
            No usamos cookies propias y la analítica se mide de forma agregada.
          </SummaryItem>
          <SummaryItem icon={BarChart3} title="No vendemos datos">
            Modulaq no vende datos de uso, consultas ni información de archivos.
          </SummaryItem>
        </section>

        <div className="mt-10 grid gap-10">
          <TopicGroup
            title="Datos y archivos"
            description="Qué queda en tu navegador y qué ocurre cuando usás herramientas con archivos."
          >
            <DetailCard icon={HardDrive} title="Procesamiento local de archivos">
              <p>
                En las herramientas de archivos disponibles, el procesamiento ocurre dentro de tu navegador cuando la
                herramienta lo permite. No subimos esos archivos a Modulaq para realizar esas operaciones.
              </p>
              <p>
                Algunas herramientas usan librerías de código abierto que también se ejecutan en tu navegador, por
                ejemplo para leer o generar PDFs e imágenes.
              </p>
            </DetailCard>

            <DetailCard icon={ShieldCheck} title="Favoritos e historial local">
              <p>
                Tus favoritos y herramientas usadas recientemente se guardan en el{" "}
                <span className="font-medium text-ink-700">localStorage</span> de tu navegador.
              </p>
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>Incluyen solo identificadores de herramientas, como ids o slugs.</li>
                <li>No incluyen contenido de tus archivos.</li>
                <li>No se sincronizan entre dispositivos.</li>
                <li>Podés borrarlos limpiando los datos del sitio en tu navegador.</li>
              </ul>
            </DetailCard>
          </TopicGroup>

          <TopicGroup
            title="Comunicación y medición"
            description="Cómo recibimos consultas y qué métricas usamos para entender el sitio."
          >
            <DetailCard icon={MessageSquare} title="Consultas">
              <p>
                Cuando enviás una consulta, usamos{" "}
                <span className="font-medium text-ink-700">Web3Forms</span> para recibir tu mensaje por correo. Los
                datos que escribís en el formulario se envían para poder responderte.
              </p>
              <p>
                Usá ese canal solo para lo que quieras compartir con nosotros. También podés escribirnos a{" "}
                <a className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </DetailCard>

            <DetailCard icon={BarChart3} title="Analítica">
              <p>
                Usamos Cloudflare Web Analytics para entender, de forma agregada, las visitas, las rutas más usadas y el
                rendimiento general del sitio.
              </p>
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>No usamos cookies para la analítica.</li>
                <li>No medimos nombres de archivos, contenido de PDFs o textos, emails ni mensajes de consultas.</li>
              </ul>
            </DetailCard>
          </TopicGroup>

          <TopicGroup
            title="Uso avanzado"
            description="Información útil si copiás ejemplos o trabajás con archivos grandes."
          >
            <DetailCard icon={Code2} title="Código integrable">
              <p>
                Los snippets de código integrable son contenido documental para que los copies y uses bajo tu
                responsabilidad. No ejecutan nada por sí solos: recién corren cuando los copiás y los usás en tu propio
                proyecto.
              </p>
            </DetailCard>

            <DetailCard icon={AlertTriangle} title="Límites de procesamiento">
              <ul className="grid list-disc gap-1.5 pl-5 marker:text-ink-300">
                <li>Algunas herramientas pueden usar memoria y CPU de tu navegador.</li>
                <li>Los archivos grandes pueden tardar o fallar según tu equipo.</li>
                <li>Los PDFs protegidos o con estructuras incompatibles pueden no procesarse.</li>
              </ul>
            </DetailCard>
          </TopicGroup>

        </div>
      </Container>
    </section>
  );
}
