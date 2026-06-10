import type { TranslationKey } from "../i18n/dictionaries/es";
import { isToolError } from "./ToolError";

type Translator = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/**
 * Convierte cualquier error en un mensaje visible para el usuario, usando
 * el diccionario activo. Si el error es un ToolError, traduce por su `code`;
 * si es cualquier otro error o valor desconocido, cae al `fallbackKey`.
 *
 * Nunca devuelve `error.message` directo porque los services históricos
 * lanzan strings ES, que no deben fugarse a las rutas EN.
 */
export function resolveToolErrorMessage(
  error: unknown,
  t: Translator,
  fallbackKey: TranslationKey,
): string {
  if (isToolError(error)) {
    return t(error.code as TranslationKey, error.vars);
  }

  return t(fallbackKey);
}
