// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';
import { rafThrottle } from './throttle';

export type KeyboardListenerOptions = {
    keySpeed?: number;
    keySpeedFast?: number;
};

export class KeyboardListener {
    public movedBy = new SyncEvent<number>();

    private _options: Required<KeyboardListenerOptions> = {
        keySpeed: 75,
        keySpeedFast: 75,
    };

    public constructor(options: KeyboardListenerOptions = {}) {
        this._options = { ...this._options, ...options };
        const throttledOnKeyDown = rafThrottle((e: KeyboardEvent) => this._onKeyDown(e));
        document.body.addEventListener('keydown', throttledOnKeyDown);
    }

    private _onKeyDown(e: KeyboardEvent): void {
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
