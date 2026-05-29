/**
 * Devuelve el nombre del archivo sin ruta y sin la extensión final.
 * `"docs/informe final.v2.pdf"` -> `"informe final.v2"`
 */
export function getBaseFileName(fileName: string): string {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() ?? fileName;
  const extensionIndex = nameWithoutPath.lastIndexOf(".");
  return extensionIndex > 0 ? nameWithoutPath.slice(0, extensionIndex) : nameWithoutPath;
}
