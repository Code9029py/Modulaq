export const PROJECT_NAME = "Modulaq";
export const CONTACT_EMAIL = "contacto@modulaq.dev";
export const CONTACT_ORIGIN = "modulaq.dev";
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
export const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() ?? "";

export type ContactType = "general" | "tool-request" | "bug-report" | "feedback";

export const contactSubjects: Record<ContactType, string> = {
  general: `[${PROJECT_NAME}] Consulta general`,
  "tool-request": `[${PROJECT_NAME}] Solicitud de herramienta`,
  "bug-report": `[${PROJECT_NAME}] Reporte de problema`,
  feedback: `[${PROJECT_NAME}] Feedback`,
};
