import { ContentManager } from '../contentmanager/ContentManager';
import { accelleratingFn, ScrollControl, ScrollControlOptions } from '../scrollcontrol/ScrollControl';
import { IScrollerContent } from './IScrollerContent';

export class Scroller<ContentT extends IScrollerContent = IScrollerContent> {
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
        this._scrollControl.destinationChanged.attach(this, (v) => this._onDestinationChanged(v));
    }

    public disable(): void {
        this._scrollControl.disable();
        this._scrollControl.positionChanged.detach(this);
        this._scrollControl.destinationChanged.detach(this);
    }

    public addContent(content: ContentT, position?: number): ContentT {
        try {
            content.seek?.attach(this, (v: number) => this._onSeeked(v, 500));
            this._contentManager.addContent(content, position);
            this._scrollControl.setBounds(this._contentManager.getExtent());
            return content;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public setSnapPositions(snapPositions: number[]): void {
        this._scrollControl.setSnapPositions(snapPositions);
    }

    public getSnapPositions(): number[] {
        return this._scrollControl.getSnapPositions();
    }

    public setScrollOptions(opts: ScrollControlOptions): void {
        this._scrollControl.setOptions(opts);
    }

    public getScrollOptions(): ScrollControlOptions {
        return this._scrollControl.getOptions();
    }

    private _onSeeked(time: number, offset?: number): void {
        if (offset !== undefined) {
            const direction = Math.sign(time - this._scrollControl.getPosition());
            this._scrollControl.setPosition(time - offset * direction);
        }
        this._scrollControl.setDestination(time);
    }

    private _onDestinationChanged(time: number): void {
        this._contentManager.getContents().forEach((c) => c.setDestination?.(time));
    }

    public reset(): void {
        // reset scroll control
        this._scrollControl.reset();

        // destroy contents
        this._contentManager.getContents().forEach((c) => c.destroy?.());

        // reset content manager
        this._contentManager.reset();
    }
}
