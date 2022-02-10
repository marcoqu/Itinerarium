import { IContent } from 'main';
import { ContentManager } from '../contentmanager/ContentManager';
import { ScrollControl } from '../scrollcontrol/ScrollControl';
export declare class Scroller<ContentT extends IContent = IContent> {
    private _scrollArea;
    private _scrollControl;
    private _contentManager;
    get scrollControl(): ScrollControl;
    get contentManager(): ContentManager<ContentT>;
    constructor(scrollArea: HTMLDivElement);
    enable(): void;
    disable(): void;
    addContent(content: ContentT, position?: number): ContentT;
    reset(): void;
}
