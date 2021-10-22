import { SyncEvent } from 'ts-events';
export declare type WheelListenerOptions = {
    wheelSpeed?: number;
};
export declare class WheelListener {
    movedBy: SyncEvent<number>;
    private _options;
    constructor(element: HTMLElement, options?: WheelListenerOptions);
    private _onWheel;
}
