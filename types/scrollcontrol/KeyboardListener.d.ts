import { SyncEvent } from 'ts-events';
export declare type KeyboardListenerOptions = {
    keySpeed?: number;
    keySpeedFast?: number;
};
export declare class KeyboardListener {
    movedBy: SyncEvent<number>;
    private _options;
    constructor(options?: KeyboardListenerOptions);
    private _onKeyDown;
}
