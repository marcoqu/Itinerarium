// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
import { timeThrottle } from './throttle';
export class KeyboardListener {
    constructor(options = {}) {
        this.movedBy = new SyncEvent();
        this._options = {
            keySpeed: 75,
            keySpeedFast: 75,
            keyThrottleDelay: 100,
        };
        document.body.addEventListener('keydown', (e) => this._throttledOnKeyDown?.(e));
        this.setOptions(options);
    }
    setOptions(options) {
        this._options = { ...this._options, ...options };
        this._throttledOnKeyDown = timeThrottle((e) => this._onKeyDown(e), this._options.keyThrottleDelay);
    }
    _onKeyDown(e) {
        e.preventDefault();
        const delta = e.shiftKey ? this._options.keySpeedFast : this._options.keySpeed;
        switch (e.key) {
            case 'ArrowRight':
                this.movedBy.post(delta);
                break;
            case 'ArrowLeft':
                this.movedBy.post(-delta);
                break;
        }
    }
}
//# sourceMappingURL=KeyboardListener.js.map