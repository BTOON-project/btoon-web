import { decode, encode, encodeAsync } from "@btoon/js";
import { decode as msgpackDecode, encode as msgpackEncode } from "@msgpack/msgpack";
import { deepEqual } from "./values";

const utf8 = new TextEncoder();

/**
 * Milliseconds per call of `fn`: one warm-up call, then `rounds` rounds that each repeat
 * `fn` for at least `minRoundMs` (browsers coarsen performance.now() to 0.1 ms or so);
 * returns the median round. Stops early, after at least one round, past `budgetMs`.
 */
export function timeIt(fn: () => unknown, rounds = 5, minRoundMs = 2, budgetMs = 400): number {
  fn();
  const deadline = performance.now() + budgetMs;
  const perCall: number[] = [];
  for (let r = 0; r < rounds; r++) {
    let calls = 0;
    let elapsed = 0;
    const start = performance.now();
    do {
      fn();
      calls++;
      elapsed = performance.now() - start;
    } while (elapsed < minRoundMs);
    perCall.push(elapsed / calls);
    if (performance.now() > deadline) break;
  }
  perCall.sort((x, y) => x - y);
  return perCall[Math.floor(perCall.length / 2)];
}

export interface Timings {
  btoonEncode: number;
  btoonDecode: number;
  msgpackEncode: number;
  msgpackDecode: number;
  jsonStringify: number;
  jsonParse: number;
}

/** Times encode and decode of one value with BTOON, MessagePack and JSON, here in the browser. */
export function measure(value: unknown, autoTabular: boolean): Timings {
  const btoon = encode(value, { autoTabular });
  const msgpack = msgpackEncode(value);
  const json = JSON.stringify(value);
  return {
    btoonEncode: timeIt(() => encode(value, { autoTabular })),
    btoonDecode: timeIt(() => decode(btoon)),
    msgpackEncode: timeIt(() => msgpackEncode(value)),
    msgpackDecode: timeIt(() => msgpackDecode(msgpack)),
    jsonStringify: timeIt(() => JSON.stringify(value)),
    jsonParse: timeIt(() => JSON.parse(json)),
  };
}

export interface Analysis {
  /** Minified JSON (JSON.stringify), UTF-8 bytes. */
  jsonBytes: number;
  msgpackBytes: number;
  /** The BTOON encoding with the chosen tabular setting. */
  btoon: Uint8Array;
  /** Size with and without the tabular encoding, to show what it saved. */
  btoonTabularBytes: number;
  btoonPlainBytes: number;
  /** The value decoded back from `btoon`. */
  decoded: unknown;
  /** decode(encode(value)) deep-equals value. */
  roundTrip: boolean;
}

/** Sizes and the round-trip check for one value, all computed here in the browser. */
export function analyze(value: unknown, autoTabular: boolean): Analysis {
  const btoonTabular = encode(value, { autoTabular: true });
  const btoonPlain = encode(value, { autoTabular: false });
  const btoon = autoTabular ? btoonTabular : btoonPlain;
  const decoded = decode(btoon);
  return {
    jsonBytes: utf8.encode(JSON.stringify(value)).length,
    msgpackBytes: msgpackEncode(value).length,
    btoon,
    btoonTabularBytes: btoonTabular.length,
    btoonPlainBytes: btoonPlain.length,
    decoded,
    roundTrip: deepEqual(decoded, value),
  };
}

export type Compressed = { bytes: number } | { skipped: string } | { unavailable: string };

/** zlib (RFC 1950) size of arbitrary bytes, using the browser's CompressionStream. */
export async function zlibSize(data: Uint8Array): Promise<Compressed> {
  if (typeof CompressionStream === "undefined") return { unavailable: "CompressionStream is not available" };
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"));
  const out = await new Response(stream).arrayBuffer();
  return { bytes: out.byteLength };
}

/**
 * Size of BTOON's zlib compression envelope (SPEC §6). Encoders skip compression for
 * documents under 256 bytes and when it saves less than 5%, and then emit the plain
 * document, so the result says which happened.
 */
export async function btoonZlibSize(value: unknown, autoTabular: boolean, plainBytes: number): Promise<Compressed> {
  if (typeof CompressionStream === "undefined") return { unavailable: "CompressionStream is not available" };
  const out = await encodeAsync(value, { autoTabular, compress: true });
  const isEnvelope = out.length >= 16 && out[0] === 0x42 && out[1] === 0x54 && out[2] === 0x4f && out[3] === 0x4e;
  if (isEnvelope) return { bytes: out.length };
  return { skipped: plainBytes < 256 ? "under 256 bytes: not compressed" : "saves under 5%: not compressed" };
}

export function utf8Length(text: string): number {
  return utf8.encode(text).length;
}
