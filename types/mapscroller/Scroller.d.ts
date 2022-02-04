import { ContentManager } from '../contentmanager/ContentManager';
import { ScrollControl, ScrollControlOptions } from '../scrollcontrol/ScrollControl';
import { IScrollerContent } from './IScrollerContent';
export declare class Scroller<ContentT extends IScrollerContent = IScrollerContent> {
    private _scrollArea;
    private _scrollControl;
    private _contentManager;
    get scrollControl(): ScrollControl;
    get contentManager(): ContentManager<ContentT>;
    constructor(scrollArea: HTMLDivElement);
    enable(): void;
    disable(): void;
    addContent(content: ContentT, position?: number): ContentT;
    setSnapPositions(snapPositions: number[]): void;
    getSnapPositions(): number[];
    setScrollOptions(opts: ScrollControlOptions): void;
    getScrollOptions(): ScrollControlOptions;
    private _onSeeked;
    private _onDestinationChanged;
    reset(): void;
}
