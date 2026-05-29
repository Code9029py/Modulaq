const knownExtensionPattern = /\.(pdf|png|txt|zip)$/i;
const reservedFileNamePattern = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Sanea un nombre de archivo para descarga: quita caracteres prohibidos,
 * extensiones conocidas y nombres reservados de Windows.
 */
export function sanitizeFileName(input: string, fallback = "archivo") {
  const cleanName = (value: string) =>
    value
      .trim()
      .replace(knownExtensionPattern, "")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim();
  const sanitizedName = cleanName(input) || cleanName(fallback) || "archivo";

  return reservedFileNamePattern.test(sanitizedName) ? `${sanitizedName}-archivo` : sanitizedName;
}
