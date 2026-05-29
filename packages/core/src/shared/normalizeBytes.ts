/**
 * Entrada binaria aceptada por las funciones del SDK que reciben archivos:
 * `File`/`Blob` del navegador, `ArrayBuffer` o `Uint8Array`.
 */
export type BinaryInput = File | Blob | ArrayBuffer | Uint8Array;

/**
 * Convierte cualquier `BinaryInput` a `Uint8Array` (apta para pdf-lib, qrcode, etc.).
 */
export async function normalizeBytes(input: BinaryInput): Promise<Uint8Array> {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  // File extends Blob; ambos exponen arrayBuffer()
  const buffer = await (input as Blob).arrayBuffer();
  return new Uint8Array(buffer);
}
