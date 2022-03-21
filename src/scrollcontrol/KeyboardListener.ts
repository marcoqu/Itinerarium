// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';
import { timeThrottle } from './throttle';

export type KeyboardListenerOptions = {
    keySpeed?: number;
    keySpeedFast?: number;
    keyThrottleDelay?: number;
};

export class KeyboardListener {
    public movedBy = new SyncEvent<number>();

    private _throttledOnKeyDown?: (e: KeyboardEvent) => void;
    private _options: Required<KeyboardListenerOptions> = {
        keySpeed: 75,
        keySpeedFast: 75,
        keyThrottleDelay: 100,
    };

    public constructor(options: KeyboardListenerOptions = {}) {
        document.body.addEventListener('keydown', (e: KeyboardEvent) => this._throttledOnKeyDown?.(e));
        this.setOptions(options);
    }

    public setOptions(options: KeyboardListenerOptions): void {
        this._options = { ...this._options, ...options };
        this._throttledOnKeyDown = timeThrottle(
            (e: KeyboardEvent) => this._onKeyDown(e),
            this._options.keyThrottleDelay,
        );
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
