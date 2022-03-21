import { SyncEvent } from 'ts-events';
export declare type KeyboardListenerOptions = {
    keySpeed?: number;
    keySpeedFast?: number;
    keyThrottleDelay?: number;
};
export declare class KeyboardListener {
    movedBy: SyncEvent<number>;
    private _throttledOnKeyDown?;
    private _options;
    constructor(options?: KeyboardListenerOptions);
    setOptions(options: KeyboardListenerOptions): void;
    private _onKeyDown;
}
