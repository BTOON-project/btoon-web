/**
 * The only error type thrown by this library's `encode`/`decode` functions (and the only
 * rejection reason of the async variants). Branch on {@link BtoonError.code}, which is
 * stable across BTOON implementations; the message is for humans and may change.
 */
export class BtoonError extends Error {
    constructor(code, message, options) {
        super(message);
        this.name = 'BtoonError';
        this.code = code;
        if (options !== undefined && 'cause' in options) {
            Object.defineProperty(this, 'cause', {
                value: options.cause,
                writable: true,
                enumerable: false,
                configurable: true,
            });
        }
    }
}
/** Shorthand used internally: `throw fail('truncated', '...')`. */
export function fail(code, message, cause) {
    return cause === undefined ? new BtoonError(code, message) : new BtoonError(code, message, { cause });
}
/**
 * True for the engine's "too much recursion" error. Raising `maxDepth` far above the
 * default can exhaust the JavaScript call stack before the depth limit triggers; that
 * case is reported as `max_depth` instead of leaking a RangeError.
 */
export function isStackOverflow(e) {
    if (e instanceof BtoonError)
        return false;
    if (typeof e !== 'object' || e === null)
        return false;
    const err = e;
    if (err.name !== 'RangeError' && err.name !== 'InternalError')
        return false;
    return typeof err.message === 'string' && /call stack|recursion/i.test(err.message);
}
