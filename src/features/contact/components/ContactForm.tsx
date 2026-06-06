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
import { TextLink } from "../../../shared/components/TextLink";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { inputClassName } from "../../../shared/styles/inputClassName";
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

const contactTypeKeys: Record<ContactType, TranslationKey> = {
  general: "contact.type.general",
  "tool-request": "contact.type.toolRequest",
  "bug-report": "contact.type.bugReport",
  feedback: "contact.type.feedback",
};

const copyKeysByType: Record<
  ContactType,
  {
    description: TranslationKey;
    detailLabel: TranslationKey;
    detailPlaceholder: TranslationKey;
    formTitle: TranslationKey;
    messageLabel: TranslationKey;
    messagePlaceholder: TranslationKey;
  }
> = {
  general: {
    formTitle: "contact.copy.general.formTitle",
    description: "contact.copy.general.description",
    detailLabel: "contact.copy.general.detailLabel",
    detailPlaceholder: "contact.copy.general.detailPlaceholder",
    messageLabel: "contact.copy.general.messageLabel",
    messagePlaceholder: "contact.copy.general.messagePlaceholder",
  },
  "tool-request": {
    formTitle: "contact.copy.toolRequest.formTitle",
    description: "contact.copy.toolRequest.description",
    detailLabel: "contact.copy.toolRequest.detailLabel",
    detailPlaceholder: "contact.copy.toolRequest.detailPlaceholder",
    messageLabel: "contact.copy.toolRequest.messageLabel",
    messagePlaceholder: "contact.copy.toolRequest.messagePlaceholder",
  },
  "bug-report": {
    formTitle: "contact.copy.bugReport.formTitle",
    description: "contact.copy.bugReport.description",
    detailLabel: "contact.copy.bugReport.detailLabel",
    detailPlaceholder: "contact.copy.bugReport.detailPlaceholder",
    messageLabel: "contact.copy.bugReport.messageLabel",
    messagePlaceholder: "contact.copy.bugReport.messagePlaceholder",
  },
  feedback: {
    formTitle: "contact.copy.feedback.formTitle",
    description: "contact.copy.feedback.description",
    detailLabel: "contact.copy.feedback.detailLabel",
    detailPlaceholder: "contact.copy.feedback.detailPlaceholder",
    messageLabel: "contact.copy.feedback.messageLabel",
    messagePlaceholder: "contact.copy.feedback.messagePlaceholder",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ initialType }: ContactFormProps) {
  const { t } = useI18n();
  const [contactType, setContactType] = useState<ContactType>(initialType);
  const [isDesktopTypeListOpen, setIsDesktopTypeListOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const copyKeys = copyKeysByType[contactType];
  const copy = useMemo(
    () => ({
      formTitle: t(copyKeys.formTitle),
      description: t(copyKeys.description),
      detailLabel: t(copyKeys.detailLabel),
      detailPlaceholder: t(copyKeys.detailPlaceholder),
      messageLabel: t(copyKeys.messageLabel),
      messagePlaceholder: t(copyKeys.messagePlaceholder),
    }),
    [copyKeys, t],
  );
  const hasDirectSubmission = WEB3FORMS_ACCESS_KEY.length > 0;
  const isSubmitting = submissionStatus === "submitting";

  const validateForm = () => {
    const nextErrors: ContactFormErrors = {};
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      nextErrors.email = t("contact.form.emailInvalid");
    }

    if (!trimmedMessage) {
      nextErrors.message = t("contact.form.messageRequired");
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
        throw new Error("Submission failed.");
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

  const contactTypeOptions: Array<{ label: string; value: ContactType }> = (
    ["general", "tool-request", "bug-report", "feedback"] as ContactType[]
  ).map((value) => ({ value, label: t(contactTypeKeys[value]) }));

  return (
    <div className={cn("grid gap-5", isDesktopTypeListOpen ? "lg:grid-cols-[240px_1fr]" : "lg:grid-cols-1")}>
      {isDesktopTypeListOpen ? (
        <aside className="hidden overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-panel ring-1 ring-surface-50/80 backdrop-blur lg:block">
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-200/80 bg-surface-50/70 px-4">
            <p className="text-sm font-semibold text-ink-900">{t("contact.aside.title")}</p>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 transition hover:text-ink-900"
              type="button"
              onClick={() => setIsDesktopTypeListOpen(false)}
            >
              {t("contact.aside.hide")}
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
          <Button type="button" variant="secondary" onClick={() => setIsDesktopTypeListOpen(true)}>
            {t("contact.aside.show")}
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      )}

      <div className="grid gap-5">
        <div className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-3 shadow-panel ring-1 ring-surface-50/80 lg:hidden">
          <p className="mb-3 text-sm font-semibold text-ink-900">{t("contact.aside.title")}</p>
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
            {t("contact.form.nameLabel")}
            <input
              className={inputClassName}
              disabled={isSubmitting}
              id="contact-name"
              placeholder={t("contact.form.namePlaceholder")}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmissionStatus("idle");
              }}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700" htmlFor="contact-email">
            {t("contact.form.emailLabel")}
            <input
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              className={inputClassName}
              disabled={isSubmitting}
              id="contact-email"
              placeholder={t("contact.form.emailPlaceholder")}
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
            <Button disabled={isSubmitting} type="submit">
              <Send className="mr-2" size={17} />
              {submissionStatus === "submitting"
                ? t("contact.form.submitting")
                : hasDirectSubmission
                  ? t("contact.form.submit")
                  : t("contact.form.submitMail")}
            </Button>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              {hasDirectSubmission ? (
                <>
                  {t("contact.form.helperWebPre")}{" "}
                  <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>
                  {t("contact.form.helperWebPost")}
                </>
              ) : (
                <>
                  {t("contact.form.helperMailPre")}{" "}
                  <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>
                  {t("contact.form.helperMailPost")}
                </>
              )}
            </p>
            {submissionStatus === "success" ? (
              <p aria-live="polite" className="mt-4 rounded-md border border-accent-teal/25 bg-accent-teal/10 px-3 py-2 text-sm text-ink-700" role="status">
                {t("contact.form.successWeb")}
              </p>
            ) : null}
            {submissionStatus === "error" ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">
                <p>{t("contact.form.errorWeb")}</p>
                <button className="mt-3 font-semibold underline underline-offset-2" type="button" onClick={openMailto}>
                  {t("contact.form.errorRetry")}
                </button>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
