import { ContentManager } from '../contentmanager/ContentManager';
import { accelleratingFn, ScrollControl } from '../scrollcontrol/ScrollControl';
export class Scroller {
    constructor(scrollArea) {
        this._scrollArea = scrollArea;
        this._scrollControl = new ScrollControl(this._scrollArea, {
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
    }
    disable() {
        this._scrollControl.disable();
        this._scrollControl.positionChanged.detach(this);
        this._scrollControl.destinationChanged.detach(this);
    }
    addContent(content, position) {
        this._contentManager.addContent(content, position);
        this._scrollControl.setBounds(this._contentManager.getExtent());
        return content;
    }
    reset() {
        // reset scroll control
        this._scrollControl.reset();
        // reset content manager
        this._contentManager.reset();
    }
}
//# sourceMappingURL=Scroller.js.map