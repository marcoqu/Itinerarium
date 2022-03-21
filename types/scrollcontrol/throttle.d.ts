declare type AnyFunction = (...args: any[]) => any;
declare type ThrottledFunction<T extends AnyFunction> = (...args: Parameters<T>) => ReturnType<T>;
export declare function timeThrottle<T extends AnyFunction>(fn: T, wait: number): ThrottledFunction<T>;
export declare function rafThrottle<T extends AnyFunction>(fn: T): ThrottledFunction<T>;
export {};
