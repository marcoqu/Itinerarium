// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';
import { rafThrottle } from './rafThrottle';

export type WheelListenerOptions = { wheelSpeed?: number };

export class WheelListener {
    public movedBy = new SyncEvent<number>();

    private _options: Required<WheelListenerOptions> = { wheelSpeed: 75 };

    public constructor(element: HTMLElement, options: WheelListenerOptions = {}) {
        this._options = { ...this._options, ...options };
        const throttledOnWheel = rafThrottle((e: WheelEvent) => this._onWheel(e));
        element.addEventListener('wheel', throttledOnWheel);
    }

    private _onWheel(e: WheelEvent): void {
        e.preventDefault();
        // discard delta and just use sign
        const sign = Math.sign(e.deltaY);
        this.movedBy.post(sign * this._options.wheelSpeed);
    }
}
