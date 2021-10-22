import { SyncEvent } from 'ts-events';
export declare class ViewportManager {
    resize: SyncEvent<this>;
    resizeStart: SyncEvent<this>;
    resizeEnd: SyncEvent<this>;
    private _throttlingInterval;
    private _viewportWidth;
    private _viewportHeight;
    private _documentWidth;
    private _documentHeight;
    private _resizeTimer;
    constructor();
    viewportWidth(): number;
    viewportHeight(): number;
    documentWidth(): number;
    documentHeight(): number;
    private _setupEventListeners;
    private _updateValues;
    private _updateViewportDimensions;
    private _updateDocumentDimensions;
    private _onResize;
    private _onThrottledResize;
}
