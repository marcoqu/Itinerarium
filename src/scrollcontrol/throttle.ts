// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;
type ThrottledFunction<T extends AnyFunction> = (...args: Parameters<T>) => ReturnType<T>;

export function timeThrottle<T extends AnyFunction>(fn: T, wait: number): ThrottledFunction<T> {
    let isCalled = false;
    let lastResult: ReturnType<T>;

    return function (...args) {
        if (!isCalled) {
            lastResult = fn(...args) as ReturnType<T>;
            isCalled = true;
            setTimeout(() => (isCalled = false), wait);
        }
        return lastResult;
    };
}

export function rafThrottle<T extends AnyFunction>(fn: T): ThrottledFunction<T> {
    let isCalled = false;
    let lastResult: ReturnType<T>;

    return function (...args) {
        if (!isCalled) {
            lastResult = fn(...args) as ReturnType<T>;
            isCalled = true;
            window.requestAnimationFrame(() => (isCalled = false));
        }
        return lastResult;
    };
}
