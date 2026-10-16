import { describe, expect, it } from 'vitest';
import { isPemCertificate, toPemCertificate } from './certificate-file';

const encode = (text: string) => new TextEncoder().encode(text);

const PEM = [
  '-----BEGIN CERTIFICATE-----',
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
  '-----END CERTIFICATE-----',
].join('\n');

describe('toPemCertificate', () => {
  it('keeps a PEM file as its provider wrote it', () => {
    expect(toPemCertificate(encode(`${PEM}\n`))).toBe(PEM);
  });

  it('keeps what surrounds the certificate, comments and chain included', () => {
    const chain = `subject=CN=acme\n${PEM}\n${PEM}`;

    expect(toPemCertificate(encode(chain))).toBe(chain);
  });

  // A `.cer` handed out by Entra ID is as often DER as PEM; sending its bytes as text would send
  // mojibake, and the API would refuse a certificate the admin downloaded one click earlier.
  it('wraps a binary DER file into PEM', () => {
    const der = new Uint8Array([0x30, 0x82, 0x01, 0x0a, 0x02, 0x82, 0xff, 0x00, 0xfe]);

    const pem = toPemCertificate(der);

    expect(pem.startsWith('-----BEGIN CERTIFICATE-----\n')).toBe(true);
    expect(pem.endsWith('\n-----END CERTIFICATE-----')).toBe(true);
    const body = pem.split('\n').slice(1, -1).join('');
    expect(body).toBe(btoa(String.fromCharCode(...der)));
  });

  it('writes the base64 in the 64-column shape every tool reads', () => {
    const der = new Uint8Array(200).fill(0x41);

    const lines = toPemCertificate(der).split('\n').slice(1, -1);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line: string) => line.length <= 64)).toBe(true);
    expect(lines[0].length).toBe(64);
  });

  // The bytes are handed to `String.fromCharCode` in slices, but encoded in one go: base64 of two
  // halves is not base64 of the whole unless the slice divides by three.
  it('handles a file larger than one encoding slice', () => {
    const der = new Uint8Array(0x8000 + 10).fill(0x2a);

    const pem = toPemCertificate(der);

    expect(pem.split('\n').slice(1, -1).join('')).toBe(
      btoa(Array.from(der, (byte) => String.fromCharCode(byte)).join('')),
    );
  });
});

describe('isPemCertificate', () => {
  it('tells a text certificate from bytes', () => {
    expect(isPemCertificate(encode(PEM))).toBe(true);
    expect(isPemCertificate(new Uint8Array([0x30, 0x82, 0x01]))).toBe(false);
  });
});
