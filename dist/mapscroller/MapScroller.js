import { ViewportManager } from '../viewportmanager/ViewportManager';
import { ContentManager } from '../contentmanager/ContentManager';
import { accelleratingFn, ScrollControl } from '../scrollcontrol/ScrollControl';
export class MapScroller {
    constructor(container, map) {
        this._contents = [];
        this._container = container;
        this._map = map;
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
        this.hide();
    }
    get scrollControl() {
        return this._scrollControl;
    }
    get contentManager() {
        return this._contentManager;
    }
    async hide() {
        this._container.classList.add('hidden');
        this.disable();
    }
    show() {
        this._container.classList.remove('hidden');
        this._contentManager.setPosition(this._scrollControl.getPosition());
        this._map.setInteractive(false);
        this.enable();
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
    async addContent(data, content, order) {
        try {
            content.init(this._container, this._map, this._viewportManager);
            content.seek?.attach(this, (v) => this._onSeeked(v, 500));
            await content.setData(data);
            this._contentManager.addContent(content, order);
            this._scrollControl.setBounds(this._contentManager.getExtent());
            this._contents.push(content);
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
    setMapStyle(styleUrl) {
        this._map.setStyle(styleUrl);
    }
    getMapStyle() {
        return this._map.getStyle();
    }
    setDetachedCamera(detached) {
        this._scrollControl[detached ? 'disable' : 'enable']();
        this._map.setInteractive(detached);
    }
    async ready() {
        return await this._map.ready();
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
    async reset() {
        // disable scroll control
        this._scrollControl.disable();
        this._scrollControl.setPosition(0);
        // reset scroll control
        this._scrollControl.reset();
        // destroy contents
        this._contents.forEach((c) => c.destroy());
        this._contents = [];
        // reset content manager
        this._contentManager.extentChanged.detach(this);
        await this._contentManager.reset();
    }
}
//# sourceMappingURL=MapScroller.js.map