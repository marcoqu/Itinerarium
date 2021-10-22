// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
import { rafThrottle } from './rafThrottle';
export class WheelListener {
    constructor(element, options = {}) {
        this.movedBy = new SyncEvent();
        this._options = { wheelSpeed: 75 };
        this._options = { ...this._options, ...options };
        const throttledOnWheel = rafThrottle((e) => this._onWheel(e));
        element.addEventListener('wheel', throttledOnWheel);
    }
    _onWheel(e) {
        e.preventDefault();
        // discard delta and just use sign
        const sign = Math.sign(e.deltaY);
        this.movedBy.post(sign * this._options.wheelSpeed);
    }
}
//# sourceMappingURL=WheelListener.js.map