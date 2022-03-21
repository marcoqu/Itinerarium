// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';
import { timeThrottle } from './throttle';

export type WheelListenerOptions = {
    wheelSpeed?: number;
    throttleMs?: number;
};

export class WheelListener {
    public movedBy = new SyncEvent<number>();

    private _options: Required<WheelListenerOptions> = { wheelSpeed: 75, throttleMs: 100 };

    public constructor(element: HTMLElement, options: WheelListenerOptions = {}) {
        this._options = { ...this._options, ...options };
        const throttledOnWheel = timeThrottle((e: WheelEvent) => this._onWheel(e), this._options.throttleMs);
        element.addEventListener('wheel', throttledOnWheel);
    }

    private _onWheel(e: WheelEvent): void {
        e.preventDefault();
        // discard delta and just use sign
        const sign = Math.sign(e.deltaY);
        this.movedBy.post(sign * this._options.wheelSpeed);
    }
}
