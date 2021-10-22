import { SyncEvent } from 'ts-events';

export class ViewportManager {
    public resize: SyncEvent<this>;
    public resizeStart: SyncEvent<this>;
    public resizeEnd: SyncEvent<this>;
    private _throttlingInterval: number;
    private _viewportWidth!: number;
    private _viewportHeight!: number;
    private _documentWidth!: number;
    private _documentHeight!: number;
    private _resizeTimer: number | null = null;

    public constructor() {
        this._throttlingInterval = 250;

        this._updateValues();
        this._setupEventListeners();

        this.resize = new SyncEvent();
        this.resizeStart = new SyncEvent();
        this.resizeEnd = new SyncEvent();
    }

    public viewportWidth(): number {
        return this._viewportWidth;
    }

    public viewportHeight(): number {
        return this._viewportHeight;
    }

    public documentWidth(): number {
        return this._documentWidth;
    }

    public documentHeight(): number {
        return this._documentHeight;
    }

    private _setupEventListeners(): void {
        window.addEventListener('orientationchange', () => this._onResize());
        window.addEventListener('resize', () => this._onResize());
    }

    // UPDATE VALUES

    private _updateValues(): void {
        this._updateViewportDimensions();
        this._updateDocumentDimensions();
    }

    private _updateViewportDimensions(): void {
        this._viewportWidth = window.innerWidth || 0;
        this._viewportHeight = window.innerHeight || 0;
    }

    private _updateDocumentDimensions(): void {
        const body = document.body;
        const html = document.documentElement;
        this._documentWidth = Math.max(
            body.scrollWidth,
            body.offsetWidth,
            html.clientWidth,
            html.scrollWidth,
            html.offsetWidth,
        );
        this._documentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
        );
    }

    // Event handlers

    private _onResize(): void {
        if (this._resizeTimer) {
            clearTimeout(this._resizeTimer);
        } else {
            this.resizeStart.post(this);
        }
        this.resize.post(this);
        this._resizeTimer = window.setTimeout(this._onThrottledResize.bind(this), this._throttlingInterval);
    }

    private _onThrottledResize(): void {
        this._updateValues();
        this._resizeTimer = null;
        this.resizeEnd.post(this);
    }
}
