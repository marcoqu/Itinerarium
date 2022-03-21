// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';

export type WheelListenerOptions = {
    wheelSpeed?: number;
};

type UnnormalizedWheelEvent = WheelEvent & Record<string, number>;

export class WheelListener {
    public movedBy = new SyncEvent<number>();

    private _options: Required<WheelListenerOptions> = { wheelSpeed: 75 };

    public constructor(element: HTMLElement, options: WheelListenerOptions = {}) {
        this._options = { ...this._options, ...options };
        element.addEventListener('wheel', (e: WheelEvent) => this._onWheel(e));
    }

    private _onWheel(e: WheelEvent): void {
        e.preventDefault();
        const deltaY = this._getNormalizedDeltaY(e as UnnormalizedWheelEvent);
        this.movedBy.post(deltaY * this._options.wheelSpeed);
    }

    // from: https://github.com/basilfx/normalize-wheel
    private _getNormalizedDeltaY(event: UnnormalizedWheelEvent): number {
        let spinY = 0;
        if ('detail' in event) spinY = event.detail;
        if ('wheelDelta' in event) spinY = -event.wheelDelta / 120;
        if ('wheelDeltaY' in event) spinY = -event.wheelDeltaY / 120;
        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) spinY = 0;
        if (event.deltaY && !spinY) spinY = event.deltaY < 1 ? -1 : 1;
        return spinY;
    }
}
