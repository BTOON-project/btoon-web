/** "1,234 B": exact byte counts read better than rounded KB for format comparisons. */
export function formatBytes(bytes: number): string {
  return `${bytes.toLocaleString("en-US")} B`;
}

/** Relative change of `value` against `baseline`, e.g. "−34.6%" or "+2.0%". */
export function formatChange(value: number, baseline: number): string {
  if (baseline === 0) return "–";
  const pct = ((value - baseline) / baseline) * 100;
  const rounded = Math.abs(pct) < 0.05 ? 0 : pct;
  if (rounded === 0) return "±0%";
  return `${rounded < 0 ? "−" : "+"}${Math.abs(rounded).toFixed(1)}%`;
}

/** Milliseconds with a unit that keeps three significant digits or so. */
export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "–";
  if (ms < 1) return `${Math.max(1, Math.round(ms * 1000))} µs`;
  if (ms < 10) return `${ms.toFixed(2)} ms`;
  if (ms < 100) return `${ms.toFixed(1)} ms`;
  return `${Math.round(ms)} ms`;
}

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += HEX[b];
  return out;
}

/**
 * Classic hex dump: offset, 16 bytes in two groups of 8, printable ASCII.
 * Stops after `maxBytes` and reports how much was left out.
 */
export function hexDump(bytes: Uint8Array, maxBytes = 16 * 1024): string {
  const shown = Math.min(bytes.length, maxBytes);
  const lines: string[] = [];
  for (let off = 0; off < shown; off += 16) {
    const row = bytes.subarray(off, Math.min(off + 16, shown));
    let hex = "";
    let ascii = "";
    for (let i = 0; i < 16; i++) {
      if (i === 8) hex += " ";
      if (i < row.length) {
        hex += `${HEX[row[i]]} `;
        ascii += row[i] >= 0x20 && row[i] < 0x7f ? String.fromCharCode(row[i]) : ".";
      } else {
        hex += "   ";
      }
    }
    lines.push(`${off.toString(16).padStart(8, "0")}  ${hex} |${ascii}|`);
  }
  if (bytes.length > shown) {
    lines.push(`… ${(bytes.length - shown).toLocaleString("en-US")} more bytes`);
  }
  return lines.join("\n");
}

/**
 * Parses pasted bytes: hex (whitespace and a leading "0x" allowed) or base64/base64url.
 * Input made only of hex digits is read as hex.
 */
export function parseBinary(text: string): Uint8Array {
  const compact = text.replace(/\s+/g, "");
  if (compact.length === 0) throw new Error("Paste hex or base64 bytes first.");
  const hex = compact.replace(/^0x/i, "");
  if (/^[0-9a-f]+$/i.test(hex)) {
    if (hex.length % 2 !== 0) throw new Error("Hex input has an odd number of digits.");
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact)) {
    const standard = compact.replace(/-/g, "+").replace(/_/g, "/");
    const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
    let binary: string;
    try {
      binary = atob(padded);
    } catch {
      throw new Error("Input is neither hex nor valid base64.");
    }
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  throw new Error("Input is neither hex nor valid base64.");
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
