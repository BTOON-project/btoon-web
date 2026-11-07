import { Ext, Timestamp } from "@btoon/js";
import { toBase64 } from "./format";

/**
 * Structural equality for JSON-like values as BTOON round-trips them: maps compare as
 * unordered key sets (BTOON writes keys in UTF-8 byte order), arrays element by element,
 * numbers with Object.is (so -0 and 0 differ, NaN equals NaN).
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) {
    if (!ArrayBuffer.isView(a) || !ArrayBuffer.isView(b)) return false;
    if (a.constructor !== b.constructor || a.byteLength !== b.byteLength) return false;
    const x = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const y = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    return x.every((v, i) => v === y[i]);
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
  }
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  const rb = b as Record<string, unknown>;
  const ra = a as Record<string, unknown>;
  for (const key of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(ra[key], rb[key])) return false;
  }
  return true;
}

function timestampText(ts: Timestamp): string | { seconds: string; nanoseconds: number } {
  const ms = Number(ts.seconds) * 1000;
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) {
    return { seconds: ts.seconds.toString(), nanoseconds: ts.nanoseconds };
  }
  const offset = ts.offsetMinutes ?? 0;
  const local = new Date(ms + offset * 60_000).toISOString().slice(0, 19);
  const frac = ts.nanoseconds === 0 ? "" : `.${String(ts.nanoseconds).padStart(9, "0").replace(/0+$/, "")}`;
  if (ts.offsetMinutes === undefined) return `${local}${frac}Z`;
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return `${local}${frac}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/**
 * Turns a decoded BTOON value into something JSON.stringify shows faithfully, using the
 * "$"-tagged forms of the btoon CLI (core tools/json_mapping.h) for types JSON lacks.
 */
export function toDisplay(value: unknown): unknown {
  if (typeof value === "bigint") return { $bigint: value.toString() };
  if (typeof value === "number") {
    if (Number.isNaN(value)) return { $float: "NaN" };
    if (value === Infinity) return { $float: "Infinity" };
    if (value === -Infinity) return { $float: "-Infinity" };
    return value;
  }
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(toDisplay);
  if (value instanceof Float32Array) return { $f32: Array.from(value, (v) => toDisplay(v)) };
  if (value instanceof Float64Array) return { $f64: Array.from(value, (v) => toDisplay(v)) };
  if (value instanceof Uint8Array) return { $binary: toBase64(value) };
  if (value instanceof Timestamp) return { $timestamp: timestampText(value) };
  if (value instanceof Date) return { $timestamp: value.toISOString() };
  if (value instanceof Ext) return { $ext: [value.type, toBase64(value.data)] };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    Object.defineProperty(out, k, { value: toDisplay(v), enumerable: true, writable: true, configurable: true });
  }
  return out;
}
