// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
export class WheelListener {
    constructor(element, options = {}) {
        this.movedBy = new SyncEvent();
        this._options = { wheelSpeed: 75 };
        element.addEventListener('wheel', (e) => this._onWheel(e));
        this.setOptions(options);
    }
    setOptions(options) {
        this._options = { ...this._options, ...options };
    }
    _onWheel(e) {
        e.preventDefault();
        const deltaY = this._getNormalizedDeltaY(e);
        this.movedBy.post(deltaY * this._options.wheelSpeed);
    }
    // from: https://github.com/basilfx/normalize-wheel
    _getNormalizedDeltaY(event) {
        let spinY = 0;
        if ('detail' in event)
            spinY = event.detail;
        if ('wheelDelta' in event)
            spinY = -event.wheelDelta / 120;
        if ('wheelDeltaY' in event)
            spinY = -event.wheelDeltaY / 120;
        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS)
            spinY = 0;
        if (event.deltaY && !spinY)
            spinY = event.deltaY < 1 ? -1 : 1;
        return spinY;
    }
}
//# sourceMappingURL=WheelListener.js.map