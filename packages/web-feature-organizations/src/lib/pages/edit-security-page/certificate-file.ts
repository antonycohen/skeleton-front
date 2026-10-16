/** What a PEM document announces; a file without it is taken for binary DER. */
const PEM_HEADER = '-----BEGIN CERTIFICATE-----';
const PEM_FOOTER = '-----END CERTIFICATE-----';
const PEM_LINE_LENGTH = 64;
/** `String.fromCharCode` is given the bytes in slices, so a large file cannot blow the stack. */
const BASE64_CHUNK = 0x8000;

/**
 * A picked certificate file as PEM, which is the only thing the API takes.
 *
 * `.pem` and `.crt` are usually text and travel as they are; a `.cer` is as often **DER**, the
 * binary encoding of the same certificate, and sending its bytes as text would send mojibake. So a
 * file that does not announce a PEM certificate is base64-encoded and wrapped here, in the 64-column
 * shape every tool writes, rather than being refused with "paste a PEM" for something the admin
 * downloaded from their provider one click earlier.
 */
export function toPemCertificate(bytes: Uint8Array): string {
  const asText = new TextDecoder().decode(bytes);
  if (asText.includes(PEM_HEADER)) {
    // Keep the document as the provider wrote it (a chain, comments, CRLF): the API parses it.
    return asText.trim();
  }

  const body = toBase64(bytes).replace(
    new RegExp(`.{1,${PEM_LINE_LENGTH}}`, 'g'),
    (line) => `${line}\n`,
  );

  return `${PEM_HEADER}\n${body}${PEM_FOOTER}`;
}

/** Whether a picked file is text that already holds a certificate, for what to say about it. */
export function isPemCertificate(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes).includes(PEM_HEADER);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + BASE64_CHUNK));
  }

  return btoa(binary);
}
