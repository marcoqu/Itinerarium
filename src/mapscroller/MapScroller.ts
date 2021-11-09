import { CameraMap as Map } from '../cameramap/CameraMap';
import { ViewportManager } from '../viewportmanager/ViewportManager';

import { IContentData } from '../contentmanager/IContent';
import { ContentManager } from '../contentmanager/ContentManager';
import { IMapScrollerContent } from './IMapScrollerContent';
import { accelleratingFn, ScrollControl, ScrollControlOptions } from '../scrollcontrol/ScrollControl';

export class MapScroller<ContentT extends IMapScrollerContent = IMapScrollerContent> {
    private _container: HTMLDivElement;

    private _viewportManager: ViewportManager;
    private _map: Map;

    private _scrollControl: ScrollControl;
    private _contentManager: ContentManager<ContentT>;

    private _contents: ContentT[] = [];

    public get scrollControl(): ScrollControl {
        return this._scrollControl;
    }

    public get contentManager(): ContentManager<ContentT> {
        return this._contentManager;
    }

    public constructor(container: HTMLDivElement, map: Map) {
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

        this._contentManager = new ContentManager<ContentT>();
        this._contentManager.extentChanged.attach(this, (e) => this._scrollControl.setBounds(e));

        this.hide();
    }

    public async hide(): Promise<void> {
        this._container.classList.add('hidden');
        this.disable();
    }

    public show(): void {
        this._container.classList.remove('hidden');
        this._contentManager.setPosition(this._scrollControl.getPosition());
        this._map.setInteractive(false);
        this.enable();
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

    // tofix
    public async addContent(data: IContentData, content: ContentT, order?: number): Promise<ContentT> {
        try {
            content.init(this._container, this._map, this._viewportManager);
            content.seek?.attach(this, (v: number) => this._onSeeked(v, 500));
            await content.setData(data);
            this._contentManager.addContent(content, order);
            this._scrollControl.setBounds(this._contentManager.getExtent());
            this._contents.push(content);
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

    public setMapStyle(styleUrl?: string): void {
        this._map.setStyle(styleUrl);
    }

    public getMapStyle(): string | undefined {
        return this._map.getStyle();
    }

    public setDetachedCamera(detached: boolean): void {
        this._scrollControl[detached ? 'disable' : 'enable']();
        this._map.setInteractive(detached);
    }

    public async ready(): Promise<void> {
        return await this._map.ready();
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

    public async reset(): Promise<void> {
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
