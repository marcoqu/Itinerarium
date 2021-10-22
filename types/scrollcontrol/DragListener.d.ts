import { SyncEvent } from 'ts-events';
export declare type DragListenerOptions = {
    dragSpeed?: number;
};
export declare class DragListener {
    movedBy: SyncEvent<number>;
    private _element;
    private _mouseY?;
    private _options;
    constructor(element: HTMLElement, options?: DragListenerOptions);
    private _onMouseDown;
    private _onMouseMove;
    private _onMouseUp;
    private _getMouseorTouchY;
}
