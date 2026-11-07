/** True for a Uint8Array from any realm (including Node.js Buffers). */
export declare function isUint8Array(v: unknown): v is Uint8Array;
/**
 * A generic MessagePack extension value: a signed 8-bit type id and an opaque payload.
 *
 * Decoding returns `Ext` for every extension id BTOON does not define (application ids
 * 0…127 and the reserved negative ids). Encoding writes it verbatim with the smallest
 * header. An `Ext` may also carry one of the ids BTOON defines (-1…-6, -10) — this is how
 * to emit a `date` (-2) or `datetime` (-3) value, which have no JavaScript type of their
 * own — but its payload must then be well-formed for that type, or encoding fails with
 * `invalid_argument`.
 */
export declare class Ext {
    /** Extension type id, an integer in [-128, 127]. */
    readonly type: number;
    /** The payload bytes (not copied by the constructor). */
    readonly data: Uint8Array;
    constructor(type: number, data: Uint8Array);
}
/**
 * A BTOON timestamp (extension -1): an instant with nanosecond precision and an optional
 * UTC offset.
 *
 * `seconds` and `nanoseconds` always describe the instant in UTC. `offsetMinutes` is
 * presentation metadata ("local time is UTC + offset") and is encoded only when present.
 * Decoding returns `Timestamp` objects when `timestamps: 'object'` is set, and for
 * instants outside the range of `Date`.
 */
export declare class Timestamp {
    /** Whole seconds since the Unix epoch (UTC), in the int64 range. */
    readonly seconds: bigint;
    /** Nanoseconds within the second, in [0, 999 999 999]. */
    readonly nanoseconds: number;
    /** UTC offset in minutes, in [-1080, 1080], or `undefined` for a plain UTC timestamp. */
    readonly offsetMinutes?: number;
    /**
     * @param seconds Seconds since the Unix epoch; a `bigint`, or a `number` that is a safe integer.
     * @param nanoseconds Nanoseconds within the second, an integer in [0, 1e9).
     * @param offsetMinutes Optional UTC offset in minutes, an integer in [-1080, 1080].
     * @throws {BtoonError} `invalid_argument` if a field is out of range.
     */
    constructor(seconds: bigint | number, nanoseconds: number, offsetMinutes?: number);
    /**
     * The instant as a `Date`. Sub-millisecond nanoseconds are truncated toward the past and
     * the offset is dropped (a `Date` has no offset).
     * @throws {BtoonError} `invalid_argument` if the instant is outside the range of `Date`.
     */
    toDate(): Date;
    /**
     * The UTC timestamp of a `Date` (millisecond precision, no offset).
     * @throws {BtoonError} `invalid_argument` for an invalid `Date`.
     */
    static fromDate(date: Date): Timestamp;
}
/** Milliseconds of a Date (from any realm); throws for an invalid Date. */
export declare function dateTime(date: unknown): number;
export declare function isExt(v: object): v is Ext;
export declare function isTimestamp(v: object): v is Timestamp;
