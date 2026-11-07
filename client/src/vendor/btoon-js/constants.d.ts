/** Version of this library. */
export declare const VERSION: "0.1.0";
/** Version of the BTOON specification this library implements. */
export declare const SPEC_VERSION: "0.1";
export declare const EXT_TIMESTAMP = -1;
export declare const EXT_DATE = -2;
export declare const EXT_DATETIME = -3;
export declare const EXT_BIGINT = -4;
export declare const EXT_F32_VECTOR = -5;
export declare const EXT_F64_VECTOR = -6;
export declare const EXT_TABULAR = -10;
export declare const TABULAR_VERSION = 1;
export declare const MAX_OFFSET_MINUTES = 1080;
export declare const NANOS_PER_SECOND = 1000000000;
export declare const DEFAULT_MAX_DEPTH = 128;
export declare const DEFAULT_MAX_DECOMPRESSED_SIZE: number;
/** Encoders SHOULD skip compression below this size (SPEC §6). */
export declare const MIN_COMPRESSION_SIZE = 256;
export declare const COMPRESSION_HEADER_SIZE = 16;
export declare const SIGNED_HEADER_SIZE = 40;
/** Compression algorithm ids of the envelope header (SPEC §6). */
export declare const ALGORITHM_IDS: {
    readonly zlib: 0;
    readonly lz4: 1;
    readonly zstd: 2;
    readonly brotli: 3;
    readonly snappy: 4;
};
export declare const ALGORITHM_NAMES: readonly ["zlib", "lz4", "zstd", "brotli", "snappy"];
/** Brands that identify {@link Ext} and {@link Timestamp} instances across module copies. */
export declare const EXT_BRAND: unique symbol;
export declare const TIMESTAMP_BRAND: unique symbol;
/** Date's representable range is ±8.64e15 ms around the epoch. */
export declare const MAX_DATE_MS = 8640000000000000;
