import { EXT_BRAND, MAX_DATE_MS, MAX_OFFSET_MINUTES, NANOS_PER_SECOND, TIMESTAMP_BRAND, } from './constants.js';
import { fail } from './errors.js';
const INT64_MIN = -(1n << 63n);
const INT64_MAX = (1n << 63n) - 1n;
/** True for a Uint8Array from any realm (including Node.js Buffers). */
export function isUint8Array(v) {
    return ArrayBuffer.isView(v) && v[Symbol.toStringTag] === 'Uint8Array';
}
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
export class Ext {
    constructor(type, data) {
        if (typeof type !== 'number' || !Number.isInteger(type) || type < -128 || type > 127) {
            throw fail('invalid_argument', `Ext type must be an integer in [-128, 127], got ${String(type)}`);
        }
        if (!isUint8Array(data)) {
            throw fail('invalid_argument', 'Ext data must be a Uint8Array');
        }
        this.type = type;
        this.data = data;
    }
}
Object.defineProperty(Ext.prototype, EXT_BRAND, { value: true });
/**
 * A BTOON timestamp (extension -1): an instant with nanosecond precision and an optional
 * UTC offset.
 *
 * `seconds` and `nanoseconds` always describe the instant in UTC. `offsetMinutes` is
 * presentation metadata ("local time is UTC + offset") and is encoded only when present.
 * Decoding returns `Timestamp` objects when `timestamps: 'object'` is set, and for
 * instants outside the range of `Date`.
 */
export class Timestamp {
    /**
     * @param seconds Seconds since the Unix epoch; a `bigint`, or a `number` that is a safe integer.
     * @param nanoseconds Nanoseconds within the second, an integer in [0, 1e9).
     * @param offsetMinutes Optional UTC offset in minutes, an integer in [-1080, 1080].
     * @throws {BtoonError} `invalid_argument` if a field is out of range.
     */
    constructor(seconds, nanoseconds, offsetMinutes) {
        let s;
        if (typeof seconds === 'bigint') {
            s = seconds;
        }
        else if (typeof seconds === 'number' && Number.isSafeInteger(seconds)) {
            s = BigInt(seconds);
        }
        else {
            throw fail('invalid_argument', 'Timestamp seconds must be a bigint or a safe integer');
        }
        if (s < INT64_MIN || s > INT64_MAX) {
            throw fail('invalid_argument', 'Timestamp seconds must fit in a signed 64-bit integer');
        }
        if (typeof nanoseconds !== 'number' ||
            !Number.isInteger(nanoseconds) ||
            nanoseconds < 0 ||
            nanoseconds >= NANOS_PER_SECOND) {
            throw fail('invalid_argument', 'Timestamp nanoseconds must be an integer in [0, 999999999]');
        }
        if (offsetMinutes !== undefined &&
            (typeof offsetMinutes !== 'number' ||
                !Number.isInteger(offsetMinutes) ||
                offsetMinutes < -MAX_OFFSET_MINUTES ||
                offsetMinutes > MAX_OFFSET_MINUTES)) {
            throw fail('invalid_argument', 'Timestamp offsetMinutes must be an integer in [-1080, 1080]');
        }
        this.seconds = s;
        this.nanoseconds = nanoseconds;
        this.offsetMinutes = offsetMinutes;
    }
    /**
     * The instant as a `Date`. Sub-millisecond nanoseconds are truncated toward the past and
     * the offset is dropped (a `Date` has no offset).
     * @throws {BtoonError} `invalid_argument` if the instant is outside the range of `Date`.
     */
    toDate() {
        const ms = this.seconds * 1000n + BigInt(Math.floor(this.nanoseconds / 1e6));
        if (ms > BigInt(MAX_DATE_MS) || ms < -BigInt(MAX_DATE_MS)) {
            throw fail('invalid_argument', 'Timestamp is outside the range of Date');
        }
        return new Date(Number(ms));
    }
    /**
     * The UTC timestamp of a `Date` (millisecond precision, no offset).
     * @throws {BtoonError} `invalid_argument` for an invalid `Date`.
     */
    static fromDate(date) {
        const ms = dateTime(date);
        const seconds = Math.floor(ms / 1000);
        return new Timestamp(BigInt(seconds), (ms - seconds * 1000) * 1e6);
    }
}
Object.defineProperty(Timestamp.prototype, TIMESTAMP_BRAND, { value: true });
/** Milliseconds of a Date (from any realm); throws for an invalid Date. */
export function dateTime(date) {
    let ms;
    try {
        ms = Date.prototype.getTime.call(date);
    }
    catch {
        throw fail('invalid_argument', 'expected a Date');
    }
    if (!Number.isFinite(ms))
        throw fail('invalid_argument', 'cannot encode an invalid Date');
    return ms;
}
export function isExt(v) {
    return v[EXT_BRAND] === true;
}
export function isTimestamp(v) {
    return v[TIMESTAMP_BRAND] === true;
}
