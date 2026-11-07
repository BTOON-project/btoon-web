import { type CompressionAlgorithm, type DecodeOptions, type EncodeOptions } from './options.js';
/** Synchronous building blocks of one environment. */
export interface Platform {
    /** Decompressors; `size` is the declared uncompressed size (already checked against the limit). */
    readonly decompress: Readonly<Partial<Record<CompressionAlgorithm, (data: Uint8Array, size: number) => Uint8Array>>>;
    readonly compress: Readonly<Partial<Record<CompressionAlgorithm, (data: Uint8Array) => Uint8Array>>>;
    hmac(key: Uint8Array, parts: readonly Uint8Array[]): Uint8Array;
    equal(a: Uint8Array, b: Uint8Array): boolean;
}
/** Input accepted by `decode`. */
export type BinaryInput = Uint8Array | ArrayBuffer | ArrayBufferView;
export declare function encodeWith(value: unknown, options: EncodeOptions | undefined, platform: Platform): Uint8Array<ArrayBuffer>;
export declare function decodeWith(data: BinaryInput, options: DecodeOptions | undefined, platform: Platform): unknown;
export declare function encodeAsyncWith(value: unknown, options: EncodeOptions | undefined, platform: Platform): Promise<Uint8Array<ArrayBuffer>>;
export declare function decodeAsyncWith(data: BinaryInput, options: DecodeOptions | undefined, platform: Platform): Promise<unknown>;
