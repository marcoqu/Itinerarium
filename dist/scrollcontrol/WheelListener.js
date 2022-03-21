// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
import { timeThrottle } from './throttle';
export class WheelListener {
    constructor(element, options = {}) {
        this.movedBy = new SyncEvent();
        this._options = { wheelSpeed: 75, throttleMs: 100, minDeltaY: 10 };
        this._options = { ...this._options, ...options };
        const throttledOnWheel = timeThrottle((e) => this._onWheel(e), this._options.throttleMs);
        element.addEventListener('wheel', throttledOnWheel);
    }
    _onWheel(e) {
        e.preventDefault();
        // filter out small trackpad delta values
        if (Math.abs(e.deltaY) < this._options.minDeltaY)
            return;
        // discard delta and just use sign
        const sign = Math.sign(e.deltaY);
        this.movedBy.post(sign * this._options.wheelSpeed);
    }
}
//# sourceMappingURL=WheelListener.js.map