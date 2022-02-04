import { MapCamera } from '../map/MapCamera';
import { ContentManager } from '../contentmanager/ContentManager';
import { IMapScrollerContent } from './IMapScrollerContent';
import { ScrollControl, ScrollControlOptions } from '../scrollcontrol/ScrollControl';
export declare class MapScroller<ContentT extends IMapScrollerContent = IMapScrollerContent> {
    private _container;
    private _viewportManager;
    private _mapCamera;
    private _scrollControl;
    private _contentManager;
    get scrollControl(): ScrollControl;
    get contentManager(): ContentManager<ContentT>;
    constructor(container: HTMLDivElement, mapCamera: MapCamera);
    enable(): void;
    disable(): void;
    addContent(content: ContentT, position?: number): Promise<ContentT>;
    setSnapPositions(snapPositions: number[]): void;
    getSnapPositions(): number[];
    setScrollOptions(opts: ScrollControlOptions): void;
    getScrollOptions(): ScrollControlOptions;
    setDetachedCamera(detached: boolean): void;
    ready(): Promise<void>;
    private _onSeeked;
    private _onDestinationChanged;
    reset(): void;
}
