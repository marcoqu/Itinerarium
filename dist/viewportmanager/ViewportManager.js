import { SyncEvent } from 'ts-events';
export class ViewportManager {
    constructor() {
        this._resizeTimer = null;
        this._throttlingInterval = 250;
        this._updateValues();
        this._setupEventListeners();
        this.resize = new SyncEvent();
        this.resizeStart = new SyncEvent();
        this.resizeEnd = new SyncEvent();
    }
    viewportWidth() {
        return this._viewportWidth;
    }
    viewportHeight() {
        return this._viewportHeight;
    }
    documentWidth() {
        return this._documentWidth;
    }
    documentHeight() {
        return this._documentHeight;
    }
    _setupEventListeners() {
        window.addEventListener('orientationchange', () => this._onResize());
        window.addEventListener('resize', () => this._onResize());
    }
    // UPDATE VALUES
    _updateValues() {
        this._updateViewportDimensions();
        this._updateDocumentDimensions();
    }
    _updateViewportDimensions() {
        this._viewportWidth = window.innerWidth || 0;
        this._viewportHeight = window.innerHeight || 0;
    }
    _updateDocumentDimensions() {
        const body = document.body;
        const html = document.documentElement;
        this._documentWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        this._documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    }
    // Event handlers
    _onResize() {
        if (this._resizeTimer) {
            clearTimeout(this._resizeTimer);
        }
        else {
            this.resizeStart.post(this);
        }
        this.resize.post(this);
        this._resizeTimer = window.setTimeout(this._onThrottledResize.bind(this), this._throttlingInterval);
    }
    _onThrottledResize() {
        this._updateValues();
        this._resizeTimer = null;
        this.resizeEnd.post(this);
    }
}
//# sourceMappingURL=ViewportManager.js.map