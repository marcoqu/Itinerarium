// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
import { rafThrottle } from './rafThrottle';
export class KeyboardListener {
    constructor(options = {}) {
        this.movedBy = new SyncEvent();
        this._options = {
            keySpeed: 75,
            keySpeedFast: 75,
        };
        this._options = { ...this._options, ...options };
        const throttledOnKeyDown = rafThrottle((e) => this._onKeyDown(e));
        document.body.addEventListener('keydown', throttledOnKeyDown);
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