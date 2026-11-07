/** Reads the envelope headers of SPEC §6 (compression) and §8 (HMAC signature). */

const ALGORITHMS = ["zlib", "LZ4", "Zstandard", "Brotli", "Snappy"];

export type Envelope =
  | { kind: "bare" }
  | { kind: "compressed"; algorithm: string; compressedSize: number; uncompressedSize: number }
  | { kind: "signed"; payloadSize: number };

const u32 = (b: Uint8Array, at: number) => ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
const startsWith = (b: Uint8Array, magic: string) =>
  b.length >= 4 && [...magic].every((c, i) => b[i] === c.charCodeAt(0));

export function inspectEnvelope(bytes: Uint8Array): Envelope {
  if (bytes.length >= 40 && startsWith(bytes, "BTSG")) return { kind: "signed", payloadSize: bytes.length - 40 };
  if (bytes.length >= 16 && startsWith(bytes, "BTON")) {
    return {
      kind: "compressed",
      algorithm: ALGORITHMS[bytes[5]] ?? `unknown (${bytes[5]})`,
      compressedSize: u32(bytes, 8),
      uncompressedSize: u32(bytes, 12),
    };
  }
  return { kind: "bare" };
}
