import { describe, expect, it } from "vitest";
import { formatBytes, formatChange, formatMs, hexDump, parseBinary, toBase64, toHex } from "./format";

describe("formatChange", () => {
  it("signs smaller and larger sizes", () => {
    expect(formatChange(2734, 4183)).toBe("−34.6%");
    expect(formatChange(102, 100)).toBe("+2.0%");
    expect(formatChange(100, 100)).toBe("±0%");
    expect(formatChange(1, 0)).toBe("–");
  });
});

describe("formatBytes / formatMs", () => {
  it("formats exact byte counts", () => {
    expect(formatBytes(1242300)).toBe("1,242,300 B");
  });
  it("picks a readable unit", () => {
    expect(formatMs(0.0123)).toBe("12 µs");
    expect(formatMs(1.537)).toBe("1.54 ms");
    expect(formatMs(12.34)).toBe("12.3 ms");
    expect(formatMs(1234.5)).toBe("1235 ms");
    expect(formatMs(NaN)).toBe("–");
  });
});

describe("hexDump", () => {
  it("prints offsets, hex and ASCII", () => {
    const bytes = new TextEncoder().encode("BTOON binary format!");
    const lines = hexDump(bytes).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("00000000  42 54 4f 4f 4e 20 62 69  6e 61 72 79 20 66 6f 72  |BTOON binary for|");
    expect(lines[1].startsWith("00000010  6d 61 74 21 ")).toBe(true);
    expect(lines[1].endsWith("|mat!|")).toBe(true);
  });
  it("truncates long input", () => {
    const dump = hexDump(new Uint8Array(100), 32);
    expect(dump.split("\n")).toHaveLength(3);
    expect(dump).toContain("68 more bytes");
  });
});

describe("parseBinary", () => {
  it("reads hex with whitespace and 0x", () => {
    expect(toHex(parseBinary("0x83 a6\n61"))).toBe("83a661");
  });
  it("reads base64 and base64url", () => {
    const bytes = Uint8Array.of(0xfb, 0xff, 0x00, 0x10);
    expect(parseBinary(toBase64(bytes))).toEqual(bytes);
    expect(parseBinary("-_8AEA")).toEqual(bytes);
  });
  it("rejects odd hex and garbage", () => {
    expect(() => parseBinary("abc")).toThrow(/odd/);
    expect(() => parseBinary("not bytes!")).toThrow(/neither/);
    expect(() => parseBinary("   ")).toThrow(/Paste/);
  });
});
