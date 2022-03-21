import { SyncEvent } from 'ts-events';
export declare type WheelListenerOptions = {
    wheelSpeed?: number;
};
export declare class WheelListener {
    movedBy: SyncEvent<number>;
    private _options;
    constructor(element: HTMLElement, options?: WheelListenerOptions);
    setOptions(options: WheelListenerOptions): void;
    private _onWheel;
    private _getNormalizedDeltaY;
}
