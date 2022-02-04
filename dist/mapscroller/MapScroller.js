import { ViewportManager } from '../viewportmanager/ViewportManager';
import { ContentManager } from '../contentmanager/ContentManager';
import { accelleratingFn, ScrollControl } from '../scrollcontrol/ScrollControl';
export class MapScroller {
    constructor(container, mapCamera) {
        this._container = container;
        this._mapCamera = mapCamera;
        this._viewportManager = new ViewportManager();
        this._scrollControl = new ScrollControl(this._container, {
            mode: 'continous',
            tolerance: 5,
            snapThreshold: 300,
            easingFn: accelleratingFn(0.1),
        });
        this._scrollControl.disable();
        this._contentManager = new ContentManager();
        this._contentManager.extentChanged.attach(this, (e) => this._scrollControl.setBounds(e));
    }
    get scrollControl() {
        return this._scrollControl;
    }
    get contentManager() {
        return this._contentManager;
    }
    enable() {
        this.disable();
        this._scrollControl.enable();
        this._scrollControl.positionChanged.attach(this._contentManager, (v) => this._contentManager.setPosition(v));
        this._scrollControl.destinationChanged.attach(this, (v) => this._onDestinationChanged(v));
    }
    disable() {
        this._scrollControl.disable();
        this._scrollControl.positionChanged.detach(this);
        this._scrollControl.destinationChanged.detach(this);
    }
    // tofix
    async addContent(content, position) {
        try {
            await content.init(this._container, this._mapCamera, this._viewportManager);
            content.seek?.attach(this, (v) => this._onSeeked(v, 500));
            this._contentManager.addContent(content, position);
            this._scrollControl.setBounds(this._contentManager.getExtent());
            return content;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    setSnapPositions(snapPositions) {
        this._scrollControl.setSnapPositions(snapPositions);
    }
    getSnapPositions() {
        return this._scrollControl.getSnapPositions();
    }
    setScrollOptions(opts) {
        this._scrollControl.setOptions(opts);
    }
    getScrollOptions() {
        return this._scrollControl.getOptions();
    }
    setDetachedCamera(detached) {
        this._scrollControl[detached ? 'disable' : 'enable']();
        this._mapCamera.setInteractive(detached);
    }
    async ready() {
        return await this._mapCamera.ready();
    }
    _onSeeked(time, offset) {
        if (offset !== undefined) {
            const direction = Math.sign(time - this._scrollControl.getPosition());
            this._scrollControl.setPosition(time - offset * direction);
        }
        this._scrollControl.setDestination(time);
    }
    _onDestinationChanged(time) {
        this._contentManager.getContents().forEach((c) => c.setDestination?.(time));
    }
    reset() {
        // reset scroll control
        this._scrollControl.reset();
        // destroy contents
        this._contentManager.getContents().forEach((c) => c.destroy());
        // reset content manager
        this._contentManager.reset();
    }
}
//# sourceMappingURL=MapScroller.js.map