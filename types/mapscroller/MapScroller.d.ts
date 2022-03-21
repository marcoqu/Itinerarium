import { CameraMap as Map } from '../map/CameraMap';
import { IContentData } from '../contentmanager/IContent';
import { ContentManager } from '../contentmanager/ContentManager';
import { IMapScrollerContent } from './IMapScrollerContent';
import { ScrollControl, ScrollControlOptions } from '../scrollcontrol/ScrollControl';
export declare class MapScroller<ContentT extends IMapScrollerContent = IMapScrollerContent> {
    private _container;
    private _viewportManager;
    private _map;
    private _scrollControl;
    private _contentManager;
    private _contents;
    get scrollControl(): ScrollControl;
    get contentManager(): ContentManager<ContentT>;
    constructor(container: HTMLDivElement, map: Map);
    hide(): Promise<void>;
    show(): void;
    enable(): void;
    disable(): void;
    addContent(data: IContentData, content: ContentT, order?: number): Promise<ContentT>;
    setSnapPositions(snapPositions: number[]): void;
    getSnapPositions(): number[];
    setScrollOptions(opts: ScrollControlOptions): void;
    getScrollOptions(): ScrollControlOptions;
    setMapStyle(styleUrl?: string): void;
    getMapStyle(): string | undefined;
    setDetachedCamera(detached: boolean): void;
    ready(): Promise<void>;
    private _onSeeked;
    private _onDestinationChanged;
    reset(): void;
}
