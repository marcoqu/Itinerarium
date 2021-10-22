// Copyright 2018 ISI Foundation

import { VoidSyncEvent } from 'ts-events';

export class RafTicker {
    public tick = new VoidSyncEvent();

    private _active?: number;

    public constructor() {
        this.tick.evtListenersChanged.attach(this, this._onListenerChanged);
    }

    public _start(): void {
        this._step();
    }

    public _stop(): void {
        if (!this._active) return;
        cancelAnimationFrame(this._active);
        this._active = undefined;
    }

    private _step(): void {
        this._active = requestAnimationFrame(() => this._step());
        this.tick.post();
    }

    private _onListenerChanged(): void {
        if (!this.tick.listenerCount()) this._stop();
        else if (!this._active) this._start();
    }
}
