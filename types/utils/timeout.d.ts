export declare function timeout<T>(p: Promise<T>, time: number): Promise<T | symbol>;
export declare function timeout<T>(p: Promise<T>, time: number, withError: true): Promise<T>;
export declare namespace timeout {
    const TIMED_OUT: unique symbol;
}
