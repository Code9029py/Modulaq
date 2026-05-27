export type DownloadExtension = "pdf" | "png" | "txt" | "zip";

const knownExtensionPattern = /\.(pdf|png|txt|zip)$/i;
const reservedFileNamePattern = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function getBaseFileName(fileName: string) {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() ?? fileName;
  const extensionIndex = nameWithoutPath.lastIndexOf(".");

  return extensionIndex > 0 ? nameWithoutPath.slice(0, extensionIndex) : nameWithoutPath;
}

export function sanitizeDownloadBaseName(input: string, fallbackBaseName: string) {
  const cleanName = (value: string) =>
    value
      .trim()
      .replace(knownExtensionPattern, "")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim();
  const sanitizedName = cleanName(input) || cleanName(fallbackBaseName) || "archivo";

  return reservedFileNamePattern.test(sanitizedName) ? `${sanitizedName}-archivo` : sanitizedName;
}

export function getSuggestedDownloadBaseName(fileName: string, fallbackBaseName: string) {
  return sanitizeDownloadBaseName(getBaseFileName(fileName), fallbackBaseName);
}

export function buildDownloadFileName(input: string, extension: DownloadExtension, fallbackBaseName: string) {
  return `${sanitizeDownloadBaseName(input, fallbackBaseName)}.${extension}`;
}
