import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_ORIGIN,
  PROJECT_NAME,
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
  contactSubjects,
  type ContactType,
} from "../../../config/contact";
import { Button } from "../../../shared/components/Button";
import { cn } from "../../../shared/utils/cn";

export type { ContactType } from "../../../config/contact";

type ContactFormProps = {
  initialType: ContactType;
};

type ContactFormErrors = {
  email?: string;
  message?: string;
};

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

type SubmissionData = {
  body: string;
  date: string;
  detail: string;
  email: string;
  message: string;
  name: string;
  subject: string;
  type: string;
};

type Web3FormsResponse = {
  success?: boolean;
};

const contactTypeOptions: Array<{ label: string; value: ContactType }> = [
  { label: "Consulta general", value: "general" },
  { label: "Solicitar herramienta", value: "tool-request" },
  { label: "Reportar problema", value: "bug-report" },
  { label: "Enviar feedback", value: "feedback" },
];

const copyByType: Record<
  ContactType,
  {
    description: string;
    detailLabel: string;
    detailPlaceholder: string;
    formTitle: string;
    messageLabel: string;
    messagePlaceholder: string;
  }
> = {
  general: {
    formTitle: "Consulta general",
    description: "Usá este canal para preguntas o comentarios sobre Modulaq.",
    detailLabel: "Tema",
    detailPlaceholder: "Ejemplo: duda sobre Modulaq",
    messageLabel: "Mensaje",
    messagePlaceholder: "Contame qué necesitás revisar o consultar...",
  },
  "tool-request": {
    formTitle: "Solicitar herramienta",
    description: "Contanos qué microherramienta te gustaría sumar al ecosistema.",
    detailLabel: "Herramienta solicitada",
    detailPlaceholder: "Ejemplo: convertir CSV a JSON",
    messageLabel: "Descripción breve",
    messagePlaceholder: "Qué debería resolver y cómo la usarías...",
  },
  "bug-report": {
    formTitle: "Reportar problema",
    description: "Ayudanos a detectar errores o comportamientos inesperados.",
    detailLabel: "Dónde ocurre",
    detailPlaceholder: "Ejemplo: catálogo, herramienta o navegación móvil",
    messageLabel: "Qué pasó",
    messagePlaceholder: "Describí el problema y los pasos para reproducirlo...",
  },
  feedback: {
    formTitle: "Enviar feedback",
    description: "Compartí tu experiencia con la beta y qué mejorarías.",
    detailLabel: "Tema del feedback",
    detailPlaceholder: "Ejemplo: facilidad de uso o resultado generado",
    messageLabel: "Feedback",
    messagePlaceholder: "Contanos qué funcionó bien o qué podríamos ajustar...",
  },
};

const inputClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/20";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ initialType }: ContactFormProps) {
  const [contactType, setContactType] = useState<ContactType>(initialType);
  const [isDesktopTypeListOpen, setIsDesktopTypeListOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const copy = useMemo(() => copyByType[contactType], [contactType]);
  const hasDirectSubmission = WEB3FORMS_ACCESS_KEY.length > 0;
  const isSubmitting = submissionStatus === "submitting";

  const validateForm = () => {
    const nextErrors: ContactFormErrors = {};
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Ingresá un correo válido o dejá este campo vacío.";
    }

    if (!trimmedMessage) {
      nextErrors.message = "Escribí un mensaje antes de continuar.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const getSubmissionData = (): SubmissionData => {
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const date = new Date().toLocaleString();
    const subject = contactSubjects[contactType];
    const body = [
      `Tipo de consulta: ${copy.formTitle}`,
      `Nombre: ${name.trim() || "No indicado"}`,
      `Email de respuesta: ${trimmedEmail || "No indicado"}`,
      `${copy.detailLabel}: ${detail.trim() || "No indicado"}`,
      `Fecha local: ${date}`,
      `Origen: ${CONTACT_ORIGIN}`,
      "",
      `${copy.messageLabel}:`,
      trimmedMessage,
    ].join("\n");

    return {
      body,
      date,
      detail: detail.trim() || "No indicado",
      email: trimmedEmail,
      message: trimmedMessage,
      name: name.trim() || "No indicado",
      subject,
      type: copy.formTitle,
    };
  };

  const openMailto = () => {
    if (!validateForm()) {
      return;
    }

    const submission = getSubmissionData();
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(submission.subject)}&body=${encodeURIComponent(submission.body)}`;
    window.location.href = mailtoUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionStatus("idle");

    if (!validateForm()) {
      return;
    }

    if (!hasDirectSubmission) {
      openMailto();
      return;
    }

    const submission = getSubmissionData();
    setSubmissionStatus("submitting");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: submission.subject,
          from_name: `${PROJECT_NAME} - ${CONTACT_ORIGIN}`,
          name: submission.name,
          ...(submission.email ? { email: submission.email } : {}),
          message: submission.message,
          tipo_de_consulta: submission.type,
          titulo: submission.detail,
          fecha_local: submission.date,
          origen: CONTACT_ORIGIN,
          botcheck: "",
        }),
      });
      const result = (await response.json()) as Web3FormsResponse;

      if (!response.ok || !result.success) {
        throw new Error("No se pudo enviar la consulta.");
      }

      setName("");
      setEmail("");
      setDetail("");
      setMessage("");
      setErrors({});
      setSubmissionStatus("success");
    } catch {
      setSubmissionStatus("error");
    }
  };

  return (
    <div className={cn("grid gap-5", isDesktopTypeListOpen ? "lg:grid-cols-[240px_1fr]" : "lg:grid-cols-1")}>
      {isDesktopTypeListOpen ? (
        <aside className="hidden overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-panel ring-1 ring-surface-50/80 backdrop-blur lg:block">
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-200/80 bg-surface-50/70 px-4">
            <p className="text-sm font-semibold text-ink-900">Tipo de mensaje</p>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 transition hover:text-ink-900"
              type="button"
              onClick={() => setIsDesktopTypeListOpen(false)}
            >
              Ocultar
              <ArrowLeft size={15} />
            </button>
          </div>
          <div className="grid gap-2 p-3">
            {contactTypeOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left text-sm font-semibold shadow-sm transition",
                  contactType === option.value
                    ? "border-ink-900 bg-ink-900 text-surface-50"
                    : "border-transparent bg-transparent text-ink-700 hover:border-surface-200/80 hover:bg-surface-50 hover:text-ink-900",
                )}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setContactType(option.value);
                  setSubmissionStatus("idle");
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </aside>
      ) : (
        <div className="hidden lg:block">
          <Button
            type="button"
            variant="secondary"
            className="shadow-sm hover:shadow-panel"
            onClick={() => setIsDesktopTypeListOpen(true)}
          >
            Mostrar opciones
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      )}

      <div className="grid gap-5">
        <div className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-3 shadow-panel ring-1 ring-surface-50/80 lg:hidden">
          <p className="mb-3 text-sm font-semibold text-ink-900">Tipo de mensaje</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {contactTypeOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                  contactType === option.value
                    ? "border-ink-900 bg-ink-900 text-surface-50"
                    : "border-surface-200/80 bg-surface-50/80 text-ink-700 hover:bg-surface-100/70",
                )}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setContactType(option.value);
                  setSubmissionStatus("idle");
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <form
          aria-busy={isSubmitting}
          className="grid gap-5 rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-5 shadow-panel ring-1 ring-surface-50/80 backdrop-blur lg:grid-cols-2"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-ink-900">{copy.formTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{copy.description}</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-700" htmlFor="contact-name">
            Nombre
            <input
              className={inputClassName}
              disabled={isSubmitting}
              id="contact-name"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmissionStatus("idle");
              }}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700" htmlFor="contact-email">
            Email de respuesta (opcional)
            <input
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              className={inputClassName}
              disabled={isSubmitting}
              id="contact-email"
              placeholder="tu@email.com"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
                setSubmissionStatus("idle");
              }}
            />
            {errors.email ? (
              <span className="text-sm font-normal text-red-700" id="contact-email-error" role="alert">
                {errors.email}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700 lg:col-span-2" htmlFor="contact-detail">
            {copy.detailLabel}
            <input
              className={inputClassName}
              disabled={isSubmitting}
              id="contact-detail"
              placeholder={copy.detailPlaceholder}
              value={detail}
              onChange={(event) => {
                setDetail(event.target.value);
                setSubmissionStatus("idle");
              }}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700 lg:col-span-2" htmlFor="contact-message">
            {copy.messageLabel} *
            <textarea
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              aria-invalid={Boolean(errors.message)}
              className={`${inputClassName} min-h-36 py-3`}
              disabled={isSubmitting}
              id="contact-message"
              placeholder={copy.messagePlaceholder}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setErrors((current) => ({ ...current, message: undefined }));
                setSubmissionStatus("idle");
              }}
            />
            {errors.message ? (
              <span className="text-sm font-normal text-red-700" id="contact-message-error" role="alert">
                {errors.message}
              </span>
            ) : null}
          </label>
          <div className="lg:col-span-2">
            <Button disabled={isSubmitting} type="submit" className="shadow-soft hover:-translate-y-0.5 hover:shadow-panel">
              <Send className="mr-2" size={17} />
              {submissionStatus === "submitting" ? "Enviando..." : hasDirectSubmission ? "Enviar consulta" : "Abrir correo"}
            </Button>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              {hasDirectSubmission ? (
                <>
                  Tu mensaje se enviará a{" "}
                  <a className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  . Si dejás tu email, responderemos a la brevedad posible.
                </>
              ) : (
                <>
                  Se abrirá tu aplicación de correo para enviar el mensaje a{" "}
                  <a className="font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  .
                </>
              )}
            </p>
            {submissionStatus === "success" ? (
              <p aria-live="polite" className="mt-4 rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700" role="status">
                Tu consulta fue enviada correctamente. Gracias por escribirnos.
              </p>
            ) : null}
            {submissionStatus === "error" ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">
                <p>No pudimos enviar tu consulta desde la web. Podés intentarlo nuevamente o enviarla desde tu aplicación de correo.</p>
                <button className="mt-3 font-semibold underline underline-offset-2" type="button" onClick={openMailto}>
                  Enviar por correo
                </button>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
