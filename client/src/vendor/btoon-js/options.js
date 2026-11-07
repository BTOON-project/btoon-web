import { ALGORITHM_NAMES, DEFAULT_MAX_DECOMPRESSED_SIZE, DEFAULT_MAX_DEPTH } from './constants.js';
import { fail } from './errors.js';
import { isWellFormed } from './utf8.js';
import { isUint8Array } from './values.js';
const DEFAULT_ENCODE = Object.freeze({
    compress: false,
    algorithm: 'zlib',
    autoTabular: true,
    maxDepth: DEFAULT_MAX_DEPTH,
    hmacKey: undefined,
    codecs: undefined,
});
const DEFAULT_DECODE = Object.freeze({
    strict: true,
    maxDepth: DEFAULT_MAX_DEPTH,
    maxDecompressedSize: DEFAULT_MAX_DECOMPRESSED_SIZE,
    autoDecompress: true,
    hmacKey: undefined,
    timestampObjects: false,
    bigintAlways: false,
    codecs: undefined,
});
function optionsObject(options, what) {
    if (options === undefined || options === null)
        return undefined;
    if (typeof options !== 'object')
        throw fail('invalid_argument', `${what} options must be an object`);
    return options;
}
function bool(o, name, dflt) {
    const v = o[name];
    if (v === undefined)
        return dflt;
    if (typeof v !== 'boolean')
        throw fail('invalid_argument', `option ${name} must be a boolean`);
    return v;
}
function count(o, name, dflt) {
    const v = o[name];
    if (v === undefined)
        return dflt;
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) {
        throw fail('invalid_argument', `option ${name} must be a non-negative integer`);
    }
    return v;
}
function oneOf(o, name, allowed, dflt) {
    const v = o[name];
    if (v === undefined)
        return dflt;
    if (typeof v !== 'string' || !allowed.includes(v)) {
        throw fail('invalid_argument', `option ${name} must be one of ${allowed.map((a) => `'${a}'`).join(', ')}`);
    }
    return v;
}
function hmacKey(o) {
    const v = o.hmacKey;
    if (v === undefined)
        return undefined;
    let key;
    if (typeof v === 'string') {
        if (!isWellFormed(v))
            throw fail('invalid_argument', 'hmacKey string contains a lone surrogate');
        key = new TextEncoder().encode(v);
    }
    else if (isUint8Array(v)) {
        key = Uint8Array.prototype.slice.call(v); // private copy: immune to later mutation
    }
    else {
        throw fail('invalid_argument', 'option hmacKey must be a Uint8Array or a string');
    }
    if (key.length === 0)
        throw fail('invalid_argument', 'option hmacKey must not be empty');
    return key;
}
function codecs(o) {
    const v = o.codecs;
    if (v === undefined)
        return undefined;
    if (typeof v !== 'object' || v === null)
        throw fail('invalid_argument', 'option codecs must be an object');
    for (const name of ALGORITHM_NAMES) {
        const c = v[name];
        if (c === undefined)
            continue;
        if (typeof c !== 'object' || c === null)
            throw fail('invalid_argument', `codecs.${name} must be an object`);
        for (const fn of ['compress', 'decompress']) {
            const f = c[fn];
            if (f !== undefined && typeof f !== 'function') {
                throw fail('invalid_argument', `codecs.${name}.${fn} must be a function`);
            }
        }
    }
    return v;
}
export function encodeConfig(options) {
    const o = optionsObject(options, 'encode');
    if (o === undefined)
        return DEFAULT_ENCODE;
    return {
        compress: bool(o, 'compress', false),
        algorithm: oneOf(o, 'compression', ALGORITHM_NAMES, 'zlib'),
        autoTabular: bool(o, 'autoTabular', true),
        maxDepth: count(o, 'maxDepth', DEFAULT_MAX_DEPTH),
        hmacKey: hmacKey(o),
        codecs: codecs(o),
    };
}
export function decodeConfig(options) {
    const o = optionsObject(options, 'decode');
    if (o === undefined)
        return DEFAULT_DECODE;
    return {
        strict: bool(o, 'strict', true),
        maxDepth: count(o, 'maxDepth', DEFAULT_MAX_DEPTH),
        maxDecompressedSize: count(o, 'maxDecompressedSize', DEFAULT_MAX_DECOMPRESSED_SIZE),
        autoDecompress: bool(o, 'autoDecompress', true),
        hmacKey: hmacKey(o),
        timestampObjects: oneOf(o, 'timestamps', ['date', 'object'], 'date') === 'object',
        bigintAlways: oneOf(o, 'bigint', ['auto', 'always'], 'auto') === 'always',
        codecs: codecs(o),
    };
}
