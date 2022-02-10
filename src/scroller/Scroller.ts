import { IContent } from 'main';
import { ContentManager } from '../contentmanager/ContentManager';
import { accelleratingFn, ScrollControl } from '../scrollcontrol/ScrollControl';

export class Scroller<ContentT extends IContent = IContent> {
    private _scrollArea: HTMLDivElement;
    private _scrollControl: ScrollControl;
    private _contentManager: ContentManager<ContentT>;

    public get scrollControl(): ScrollControl {
        return this._scrollControl;
    }

    public get contentManager(): ContentManager<ContentT> {
        return this._contentManager;
    }

    public constructor(scrollArea: HTMLDivElement) {
        this._scrollArea = scrollArea;

        this._scrollControl = new ScrollControl(this._scrollArea, {
            mode: 'continous',
            tolerance: 5,
            snapThreshold: 300,
            easingFn: accelleratingFn(0.1),
        });
        this._scrollControl.disable();

        this._contentManager = new ContentManager<ContentT>();
        this._contentManager.extentChanged.attach(this, (e) => this._scrollControl.setBounds(e));
    }

    public enable(): void {
        this.disable();
        this._scrollControl.enable();
        this._scrollControl.positionChanged.attach(this._contentManager, (v) => this._contentManager.setPosition(v));
    }

    public disable(): void {
        this._scrollControl.disable();
        this._scrollControl.positionChanged.detach(this);
        this._scrollControl.destinationChanged.detach(this);
    }

    public addContent(content: ContentT, position?: number): ContentT {
        this._contentManager.addContent(content, position);
        this._scrollControl.setBounds(this._contentManager.getExtent());
        return content;
    }

    public reset(): void {
        // reset scroll control
        this._scrollControl.reset();

        // reset content manager
        this._contentManager.reset();
    }
}
