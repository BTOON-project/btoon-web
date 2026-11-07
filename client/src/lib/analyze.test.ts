import { encode, encodeAsync } from "@btoon/js";
import { encode as msgpackEncode } from "@msgpack/msgpack";
import { describe, expect, it } from "vitest";
import { analyze, btoonZlibSize, measure, timeIt, zlibSize } from "./analyze";
import { DATASETS } from "./datasets";
import { toHex } from "./format";
import { inspectEnvelope } from "./inspect";

describe("analyze", () => {
  for (const dataset of DATASETS) {
    it(`${dataset.id}: round-trips and matches MessagePack without tables`, () => {
      for (const n of [1, 2, 7, 100]) {
        const value = dataset.generate(n);
        const a = analyze(value, true);
        expect(a.roundTrip).toBe(true);
        // Without tables, BTOON is canonical MessagePack, so the size equals @msgpack/msgpack's.
        expect(a.btoonPlainBytes).toBe(a.msgpackBytes);
        if (n === 100) {
          if (dataset.tabular) expect(a.btoonTabularBytes).toBeLessThan(a.btoonPlainBytes);
          else expect(a.btoonTabularBytes).toBe(a.btoonPlainBytes);
        }
      }
    });
  }

  it("generates the same data every time", () => {
    for (const dataset of DATASETS) {
      expect(JSON.stringify(dataset.generate(50))).toBe(JSON.stringify(dataset.generate(50)));
    }
  });

  it("honors autoTabular", () => {
    const value = DATASETS[0].generate(100);
    expect(analyze(value, false).btoon.length).toBe(analyze(value, true).btoonPlainBytes);
  });
});

// The numbers quoted in the page copy must stay true.
describe("figures quoted on the site", () => {
  it("Home: 100 users", () => {
    const users = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `User${i}`, email: `user${i}@example.com` }));
    expect(encode(users).length).toBe(2734);
    expect(msgpackEncode(users).length).toBe(4183);
    expect(new TextEncoder().encode(JSON.stringify(users)).length).toBe(5471);
  });

  it("Docs: canonical map example (SPEC §4)", () => {
    expect(toHex(encode({ name: "Alice", age: 30, active: true }))).toBe("83a6616374697665c3a36167651ea46e616d65a5416c696365");
  });

  it("Docs: tabular example", () => {
    const three = [
      { city: "Oslo", temperature: 4 },
      { city: "Rome", temperature: 18 },
      { city: "Lima", temperature: 22 },
    ];
    expect(toHex(encode(three))).toBe(
      "c73ff6" + "00000001" + "00000002" + "00000003" + "00000004" + "63697479" + "0000000b" + "74656d7065726174757265" +
        "0502" + "0000000f" + "a44f736c6f" + "a4526f6d65" + "a44c696d61" + "00000003" + "041216"
    );
    expect(encode(three, { autoTabular: false }).length).toBe(73);
    expect(encode(three.slice(0, 2)).length).toBe(49);
    expect(encode(three.slice(0, 2), { autoTabular: false }).length).toBe(49);
  });
});

describe("compression", () => {
  it("reports the zlib envelope size, or why it was skipped", async () => {
    const big = DATASETS[0].generate(100);
    const plain = encode(big).length;
    const result = await btoonZlibSize(big, true, plain);
    expect("bytes" in result && result.bytes < plain).toBe(true);
    expect(await btoonZlibSize({ a: 1 }, true, encode({ a: 1 }).length)).toEqual({ skipped: "under 256 bytes: not compressed" });
    const json = await zlibSize(new TextEncoder().encode(JSON.stringify(big)));
    expect("bytes" in json && json.bytes > 0).toBe(true);
  });

  it("recognizes envelopes", async () => {
    const value = DATASETS[1].generate(200);
    const packed = await encodeAsync(value, { compress: true });
    const env = inspectEnvelope(packed);
    expect(env.kind).toBe("compressed");
    if (env.kind === "compressed") {
      expect(env.algorithm).toBe("zlib");
      expect(env.compressedSize).toBe(packed.length - 16);
      expect(env.uncompressedSize).toBe(encode(value).length);
    }
    const signed = await encodeAsync(value, { hmacKey: new Uint8Array(32).fill(7) });
    expect(inspectEnvelope(signed)).toEqual({ kind: "signed", payloadSize: signed.length - 40 });
    expect(inspectEnvelope(encode(1))).toEqual({ kind: "bare" });
  });
});

describe("timing", () => {
  it("returns per-call milliseconds", () => {
    const ms = timeIt(() => JSON.stringify({ a: 1 }), 3, 1, 50);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThan(1);
    const t = measure(DATASETS[0].generate(10), true);
    for (const v of Object.values(t)) expect(v).toBeGreaterThan(0);
  });
});
