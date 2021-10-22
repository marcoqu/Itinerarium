export function timeout<T>(p: Promise<T>, time: number): Promise<T | symbol>;
export function timeout<T>(p: Promise<T>, time: number, withError: true): Promise<T>;
export function timeout<T>(p: Promise<T>, time: number, withError = false): Promise<T | symbol> {
    const timeoutPromise = new Promise<symbol>((resolve, reject) => {
        setTimeout(() => (withError ? reject("Time's up!") : resolve(timeout.TIMED_OUT)), time);
    });
    return Promise.race([p, timeoutPromise]);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace timeout {
    export const TIMED_OUT = Symbol('Timed out');
}
