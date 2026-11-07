import { decode, encode, Ext, Timestamp } from "@btoon/js";
import { describe, expect, it } from "vitest";
import { deepEqual, toDisplay } from "./values";

describe("deepEqual", () => {
  it("treats maps as unordered and arrays as ordered", () => {
    expect(deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });
  it("compares numbers with Object.is", () => {
    expect(deepEqual(-0, 0)).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
  });
  it("compares bytes and dates", () => {
    expect(deepEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2))).toBe(true);
    expect(deepEqual(Uint8Array.of(1, 2), Float32Array.of(1, 2))).toBe(false);
    expect(deepEqual(new Date(5), new Date(5))).toBe(true);
  });
  it("sees own __proto__ keys", () => {
    const a = JSON.parse('{"__proto__": 1}');
    expect(deepEqual(a, decode(encode(a)))).toBe(true);
    expect(deepEqual(a, {})).toBe(false);
  });
});

describe("toDisplay", () => {
  it("tags the types JSON lacks like the btoon CLI", () => {
    const value = {
      big: 2n ** 70n,
      bin: Uint8Array.of(1, 2, 3),
      nan: NaN,
      inf: -Infinity,
      vec: Float32Array.of(1.5),
      ext: new Ext(7, Uint8Array.of(0xff)),
      ts: new Timestamp(1704067200n, 500_000_000),
      tz: new Timestamp(0n, 0, 120),
    };
    expect(toDisplay(value)).toEqual({
      big: { $bigint: "1180591620717411303424" },
      bin: { $binary: "AQID" },
      nan: { $float: "NaN" },
      inf: { $float: "-Infinity" },
      vec: { $f32: [1.5] },
      ext: { $ext: [7, "/w=="] },
      ts: { $timestamp: "2024-01-01T00:00:00.5Z" },
      tz: { $timestamp: "1970-01-01T02:00:00+02:00" },
    });
  });
  it("round-trips decoded values from @btoon/js", () => {
    const decoded = decode(encode({ when: new Timestamp(1n, 0), n: 1 }), { timestamps: "object" });
    expect(toDisplay(decoded)).toEqual({ n: 1, when: { $timestamp: "1970-01-01T00:00:01Z" } });
  });
});
