// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';

import { RafTicker } from './RafTicker';
import { DragListener, DragListenerOptions } from './DragListener';
import { WheelListener, WheelListenerOptions } from './WheelListener';
import { KeyboardListener, KeyboardListenerOptions } from './KeyboardListener';

type EasingFn = (
    prevDestination: number,
    destination: number,
    options: ScrollControlOptions,
) => (pos: number) => number;

export type ScrollingMode = 'continous' | 'discrete' | 'snapped';

export type ScrollControlOptions = WheelListenerOptions &
    DragListenerOptions &
    KeyboardListenerOptions & {
        mode?: ScrollingMode;
        easingFn?: EasingFn;
        speedFactor?: number;
        accelleration?: number;
        snapThreshold?: number;
        waitTime?: number;
        tolerance?: number;
    };

export class ScrollControl {
    private static DEFAULT_OPTIONS: Required<ScrollControlOptions> = {
        mode: 'continous',
        easingFn: noEasing,
        accelleration: 0.1,
        tolerance: 0.1,
        speedFactor: 1,
        dragSpeed: 5,
        wheelSpeed: 75,
        snapThreshold: 0,
        keySpeed: 10,
        keySpeedFast: 100,
        keyThrottleDelay: 100,
        waitTime: 200,
    };

    public boundsChanged = new SyncEvent<[number, number]>();
    public positionChanged = new SyncEvent<number>();
    public destinationChanged = new SyncEvent<number>();

    private _bounds: [number, number] = [0, 0];
    private _element: HTMLElement;

    private _prevSnapDestination = 0;
    private _snapDestination = 0;
    private _prevDestination = 0;
    private _destination = 0;
    private _position = 0;

    private _snapPositions: number[] = [];
    private _uniqueSnapPositions: number[] = [];

    private _throttleTimer?: number;
    private _ticker: RafTicker;
    private _wheelListener: WheelListener;
    private _dragListener: DragListener;
    private _keyboardListener: KeyboardListener;

    private _options: Required<ScrollControlOptions> = ScrollControl.DEFAULT_OPTIONS;

    public constructor(element: HTMLElement, options: ScrollControlOptions = {}) {
        this._element = element;
        this.setOptions(options);

        this._ticker = new RafTicker();

        this._wheelListener = new WheelListener(this._element, this._options);
        this._wheelListener.movedBy.attach(this, this._onMoved);

        this._dragListener = new DragListener(this._element, this._options);
        this._dragListener.movedBy.attach(this, this._onMoved);

        this._keyboardListener = new KeyboardListener(this._options);
        this._keyboardListener.movedBy.attach(this, this._onMoved);
    }

    public enable(): void {
        this._wheelListener.movedBy.attach(this, this._onMoved);
        this._dragListener.movedBy.attach(this, this._onMoved);
        this._keyboardListener.movedBy.attach(this, this._onMoved);
        this.positionChanged.post(this._position);
        this.destinationChanged.post(this._destination);
        this._element.style.pointerEvents = 'all';
    }

    public disable(): void {
        this._wheelListener.movedBy.detach(this, this._onMoved);
        this._dragListener.movedBy.detach(this, this._onMoved);
        this._keyboardListener.movedBy.detach(this, this._onMoved);
        this._element.style.pointerEvents = 'none';
    }

    public setOptions(options: ScrollControlOptions): void {
        this._options = { ...this._options, ...options };
        this._wheelListener.setOptions(this._options);
        this._dragListener.setOptions(this._options);
        this._keyboardListener.setOptions(this._options);
    }

    public getOptions(): ScrollControlOptions {
        return this._options;
    }

    public getPosition(): number {
        return this._position;
    }

    public setPosition(value: number): void {
        this._position = this._stayWithinBounds(value);
        this.positionChanged.post(this._position);
        this.setDestination(value);
    }

    public getBounds(): [number, number] {
        return this._bounds;
    }

    public setBounds(value: [number, number]): void {
        this._bounds = value;
        this._calcUniqueSnapPositions();
        this.boundsChanged.post(this._bounds);
        this.setDestination(this._destination);
        this.setPosition(this._position);
    }

    public getDestination(): number {
        return this._destination;
    }

    public getSnapDestination(): number {
        return this._snapDestination;
    }

    public setDestination(value: number): void {
        if (this._destination === value) return;
        this._prevDestination = this._destination;
        this._destination = this._stayWithinBounds(value);
        const direction = Math.sign(this._destination - this._prevDestination);
        this._prevSnapDestination = this._snapDestination;
        this._snapDestination = this._snapToPoint(this._destination, direction);
        this._ticker.tick.detach(this);
        this._ticker.tick.attach(this, this._makeTickHandler(this._prevSnapDestination, this._snapDestination));
        this.destinationChanged.post(this._snapDestination);
    }

    public setSnapPositions(positions: number[]): void {
        this._snapPositions = positions;
        this._calcUniqueSnapPositions();
    }

    public getSnapPositions(): number[] {
        return this._snapPositions;
    }

    public reset(): void {
        this._snapPositions = [];
        this._uniqueSnapPositions = [];
        this._position = 0;
        this._destination = 0;
        this._prevDestination = 0;
        this._snapDestination = 0;
        this._prevSnapDestination = 0;
        this._bounds = [0, 0];
        this._throttleTimer = undefined;
    }

    private _stayWithinBounds(y: number): number {
        return Math.min(Math.max(y, this._bounds[0]), this._bounds[1]);
    }

    private _makeTickHandler(prevDestination: number, destination: number): () => void {
        const easingFn = this._options.easingFn(prevDestination, destination, this._options);
        return () => {
            const distance = this._snapDestination - this._position;
            if (!distance) this._ticker.tick.detach(this);
            if (Math.abs(distance) < this._options.tolerance) this._position = this._snapDestination;
            else this._position = easingFn(this._position);
            this.positionChanged.post(this._position);
        };
    }

    private _onMoved(delta: number): void {
        switch (this._options.mode) {
            case 'continous': {
                this.setDestination(this._destination + delta * this._options.speedFactor);
                break;
            }
            case 'discrete': {
                if (this._throttleTimer != undefined) this.setDestination(this._getNextSnapPosition(delta));
                this._throttleTimer = setTimeout(() => (this._throttleTimer = undefined), this._options.waitTime);
                break;
            }
            default:
                throw new Error('Unknown scrolling mode');
        }
    }

    private _getNextSnapPosition(delta: number): number {
        let positionIdx: number;
        if (delta > 0) {
            positionIdx = this._uniqueSnapPositions.findIndex((pos) => pos > this._position);
            if (positionIdx === -1) positionIdx = this._uniqueSnapPositions.length - 1;
        } else {
            positionIdx = this._uniqueSnapPositions.findIndex((pos) => pos >= this._position);
            if (positionIdx === -1) positionIdx = this._uniqueSnapPositions.length - 1;
            if (positionIdx > 0) positionIdx -= 1;
        }
        return this._uniqueSnapPositions[positionIdx];
    }

    private _calcUniqueSnapPositions(): void {
        this._uniqueSnapPositions = this._snapPositions.filter((pos) => pos > this._bounds[0] && pos < this._bounds[1]);
        this._uniqueSnapPositions = this._uniqueSnapPositions.concat(this._bounds);
        this._uniqueSnapPositions = [...new Set(this._uniqueSnapPositions)];
        this._uniqueSnapPositions.sort((a, b) => a - b);
    }

    private _snapToPoint(destination: number, delta: number): number {
        const direction = Math.sign(delta);
        const snappedDestination = this._snapPositions.find((p) => {
            const distance = (p - destination) * direction;
            return distance > 0 && distance < this._options.snapThreshold;
        });
        return snappedDestination ?? destination;
    }
}

export function noEasing(prevDestination: number, destination: number): (pos: number) => number {
    return () => destination;
}

export function accelleratingFn(accelleration: number): EasingFn {
    return (prevDestination: number, destination: number, options: ScrollControlOptions) => {
        return (position: number) => position + (destination - position) * accelleration * (options.speedFactor ?? 1);
    };
}

export function fixedTime(ticks: number, easing?: (t: number) => number): EasingFn {
    const ease = easing ?? ((x: number) => x);
    return (prevDestination: number, destination: number, options: ScrollControlOptions) => {
        let currentTick = 0;
        ticks /= options.speedFactor ?? 1;
        return () => {
            if (currentTick++ === ticks) return destination;
            const ratio = ease(currentTick / ticks);
            return prevDestination + ratio * (destination - prevDestination);
        };
    };
}

export function fixedSpeed(speed: number, easing?: (t: number) => number): EasingFn {
    const ease = easing ?? ((x: number) => x);
    return (prevDestination: number, destination: number, options: ScrollControlOptions) => {
        let ticks = Math.ceil(Math.abs(prevDestination - destination) / speed);
        ticks /= options.speedFactor ?? 1;
        let currentTick = 0;
        return () => {
            if (currentTick++ === ticks) return destination;
            const ratio = ease(currentTick / ticks);
            return prevDestination + ratio * (destination - prevDestination);
        };
    };
}
