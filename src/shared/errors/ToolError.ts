export type ToolErrorVars = Record<string, string | number>;

/**
 * Error transportado por services/helpers para que los renderers traduzcan
 * el mensaje según el idioma activo. El `code` es la clave i18n y `vars`
 * los placeholders de interpolación.
 */
export class ToolError extends Error {
  readonly code: string;
  readonly vars?: ToolErrorVars;

  constructor(code: string, vars?: ToolErrorVars) {
    super(code);
    this.name = "ToolError";
    this.code = code;
    this.vars = vars;
  }
}

export function isToolError(value: unknown): value is ToolError {
  return value instanceof ToolError;
}
