declare type Fn<argsT extends unknown[] = unknown[]> = (...args: argsT) => void;
export declare const rafThrottle: <argsT extends unknown[] = unknown[]>(fn: Fn<argsT>) => Fn<argsT>;
export {};
