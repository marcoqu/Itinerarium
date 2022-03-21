// Copyright 2018 ISI Foundation
import { SyncEvent } from 'ts-events';
import { RafTicker } from './RafTicker';
import { DragListener } from './DragListener';
import { WheelListener } from './WheelListener';
import { KeyboardListener } from './KeyboardListener';
export class ScrollControl {
    constructor(element, options = {}) {
        this.boundsChanged = new SyncEvent();
        this.positionChanged = new SyncEvent();
        this.destinationChanged = new SyncEvent();
        this._bounds = [0, 0];
        this._prevSnapDestination = 0;
        this._snapDestination = 0;
        this._prevDestination = 0;
        this._destination = 0;
        this._position = 0;
        this._snapPositions = [];
        this._uniqueSnapPositions = [];
        this._options = ScrollControl.DEFAULT_OPTIONS;
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
    enable() {
        this._wheelListener.movedBy.attach(this, this._onMoved);
        this._dragListener.movedBy.attach(this, this._onMoved);
        this._keyboardListener.movedBy.attach(this, this._onMoved);
        this.positionChanged.post(this._position);
        this.destinationChanged.post(this._destination);
        this._element.style.pointerEvents = 'all';
    }
    disable() {
        this._wheelListener.movedBy.detach(this, this._onMoved);
        this._dragListener.movedBy.detach(this, this._onMoved);
        this._keyboardListener.movedBy.detach(this, this._onMoved);
        this._element.style.pointerEvents = 'none';
    }
    setOptions(options) {
        this._options = { ...this._options, ...options };
    }
    getOptions() {
        return this._options;
    }
    getPosition() {
        return this._position;
    }
    setPosition(value) {
        this._position = this._stayWithinBounds(value);
        this.positionChanged.post(this._position);
        this.setDestination(value);
    }
    getBounds() {
        return this._bounds;
    }
    setBounds(value) {
        this._bounds = value;
        this._calcUniqueSnapPositions();
        this.boundsChanged.post(this._bounds);
        this.setDestination(this._destination);
        this.setPosition(this._position);
    }
    getDestination() {
        return this._destination;
    }
    getSnapDestination() {
        return this._snapDestination;
    }
    setDestination(value) {
        if (this._destination === value)
            return;
        this._prevDestination = this._destination;
        this._destination = this._stayWithinBounds(value);
        const direction = Math.sign(this._destination - this._prevDestination);
        this._prevSnapDestination = this._snapDestination;
        this._snapDestination = this._snapToPoint(this._destination, direction);
        this._ticker.tick.detach(this);
        this._ticker.tick.attach(this, this._makeTickHandler(this._prevSnapDestination, this._snapDestination));
        this.destinationChanged.post(this._snapDestination);
    }
    setSnapPositions(positions) {
        this._snapPositions = positions;
        this._calcUniqueSnapPositions();
    }
    getSnapPositions() {
        return this._snapPositions;
    }
    reset() {
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
    _stayWithinBounds(y) {
        return Math.min(Math.max(y, this._bounds[0]), this._bounds[1]);
    }
    _makeTickHandler(prevDestination, destination) {
        const easingFn = this._options.easingFn(prevDestination, destination, this._options);
        return () => {
            const distance = this._snapDestination - this._position;
            if (!distance)
                this._ticker.tick.detach(this);
            if (Math.abs(distance) < this._options.tolerance)
                this._position = this._snapDestination;
            else
                this._position = easingFn(this._position);
            this.positionChanged.post(this._position);
        };
    }
    _onMoved(delta) {
        switch (this._options.mode) {
            case 'continous': {
                this.setDestination(this._destination + delta * this._options.speedFactor);
                break;
            }
            case 'discrete': {
                if (this._throttleTimer != undefined)
                    this.setDestination(this._getNextSnapPosition(delta));
                this._throttleTimer = setTimeout(() => (this._throttleTimer = undefined), this._options.waitTime);
                break;
            }
            default:
                throw new Error('Unknown scrolling mode');
        }
    }
    _getNextSnapPosition(delta) {
        let positionIdx;
        if (delta > 0) {
            positionIdx = this._uniqueSnapPositions.findIndex((pos) => pos > this._position);
            if (positionIdx === -1)
                positionIdx = this._uniqueSnapPositions.length - 1;
        }
        else {
            positionIdx = this._uniqueSnapPositions.findIndex((pos) => pos >= this._position);
            if (positionIdx === -1)
                positionIdx = this._uniqueSnapPositions.length - 1;
            if (positionIdx > 0)
                positionIdx -= 1;
        }
        return this._uniqueSnapPositions[positionIdx];
    }
    _calcUniqueSnapPositions() {
        this._uniqueSnapPositions = this._snapPositions.filter((pos) => pos > this._bounds[0] && pos < this._bounds[1]);
        this._uniqueSnapPositions = this._uniqueSnapPositions.concat(this._bounds);
        this._uniqueSnapPositions = [...new Set(this._uniqueSnapPositions)];
        this._uniqueSnapPositions.sort((a, b) => a - b);
    }
    _snapToPoint(destination, delta) {
        const direction = Math.sign(delta);
        const snappedDestination = this._snapPositions.find((p) => {
            const distance = (p - destination) * direction;
            return distance > 0 && distance < this._options.snapThreshold;
        });
        return snappedDestination ?? destination;
    }
}
ScrollControl.DEFAULT_OPTIONS = {
    mode: 'continous',
    easingFn: noEasing,
    accelleration: 0.1,
    tolerance: 0.1,
    speedFactor: 1,
    dragSpeed: 5,
    wheelSpeed: 75,
    throttleMs: 100,
    snapThreshold: 0,
    keySpeed: 10,
    waitTime: 200,
    keySpeedFast: 100,
};
export function noEasing(prevDestination, destination) {
    return () => destination;
}
export function accelleratingFn(accelleration) {
    return (prevDestination, destination, options) => {
        return (position) => position + (destination - position) * accelleration * (options.speedFactor ?? 1);
    };
}
export function fixedTime(ticks, easing) {
    const ease = easing ?? ((x) => x);
    return (prevDestination, destination, options) => {
        let currentTick = 0;
        ticks /= options.speedFactor ?? 1;
        return () => {
            if (currentTick++ === ticks)
                return destination;
            const ratio = ease(currentTick / ticks);
            return prevDestination + ratio * (destination - prevDestination);
        };
    };
}
export function fixedSpeed(speed, easing) {
    const ease = easing ?? ((x) => x);
    return (prevDestination, destination, options) => {
        let ticks = Math.ceil(Math.abs(prevDestination - destination) / speed);
        ticks /= options.speedFactor ?? 1;
        let currentTick = 0;
        return () => {
            if (currentTick++ === ticks)
                return destination;
            const ratio = ease(currentTick / ticks);
            return prevDestination + ratio * (destination - prevDestination);
        };
    };
}
//# sourceMappingURL=ScrollControl.js.map