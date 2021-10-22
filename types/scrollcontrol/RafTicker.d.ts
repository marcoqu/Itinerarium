import { VoidSyncEvent } from 'ts-events';
export declare class RafTicker {
    tick: VoidSyncEvent;
    private _active?;
    constructor();
    _start(): void;
    _stop(): void;
    private _step;
    private _onListenerChanged;
}
