// Copyright 2018 ISI Foundation

import { SyncEvent } from 'ts-events';

export type DragListenerOptions = { dragSpeed?: number };

export class DragListener {
    public movedBy = new SyncEvent<number>();

    private _element: HTMLElement;
    private _mouseY?: number;
    private _options: Required<DragListenerOptions> = { dragSpeed: 5 };

    public constructor(element: HTMLElement, options: DragListenerOptions = {}) {
        this._element = element;
        this._options = { ...this._options, ...options };

        this._element.addEventListener('mousedown', (e) => this._onMouseDown(e), { passive: true });
        this._element.addEventListener('mousemove', (e) => this._onMouseMove(e), { passive: true });
        this._element.addEventListener('mouseup', () => this._onMouseUp(), { passive: true });
        this._element.addEventListener('mouseleave', () => this._onMouseUp(), { passive: true });

        // set style "touch-action: none" to make it work on edge
        this._element.style.touchAction = 'none';
        this._element.addEventListener('touchstart', (e) => this._onMouseDown(e), { passive: false });
        this._element.addEventListener('touchmove', (e) => this._onMouseMove(e), { passive: false });
        this._element.addEventListener('touchend', () => this._onMouseUp(), { passive: false });
    }

    private _onMouseDown(e: MouseEvent | TouchEvent): void {
        this._mouseY = this._getMouseorTouchY(e);
    }

    private _onMouseMove(e: MouseEvent | TouchEvent): void {
        if (!this._mouseY) return;
        const currentY = this._getMouseorTouchY(e);
        const mouseDelta = (this._mouseY - currentY) * this._options.dragSpeed;
        this._mouseY = currentY;
        this.movedBy.post(mouseDelta);
    }

    private _onMouseUp(): void {
        this._mouseY = undefined;
    }

    private _getMouseorTouchY(e: MouseEvent | TouchEvent): number {
        return (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;
    }
}
