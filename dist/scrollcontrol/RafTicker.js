// Copyright 2018 ISI Foundation
import { VoidSyncEvent } from 'ts-events';
export class RafTicker {
    constructor() {
        this.tick = new VoidSyncEvent();
        this.tick.evtListenersChanged.attach(this, this._onListenerChanged);
    }
    _start() {
        this._step();
    }
    _stop() {
        if (!this._active)
            return;
        cancelAnimationFrame(this._active);
        this._active = undefined;
    }
    _step() {
        this._active = requestAnimationFrame(() => this._step());
        this.tick.post();
    }
    _onListenerChanged() {
        if (!this.tick.listenerCount())
            this._stop();
        else if (!this._active)
            this._start();
    }
}
//# sourceMappingURL=RafTicker.js.map