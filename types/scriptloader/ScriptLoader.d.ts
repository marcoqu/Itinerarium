import { Scroller } from '../scroller/Scroller';
import { IScrollerContent } from '../scroller/IScrollerContent';
import { ScriptData } from './ScriptData';
import { IContentData } from '../contentmanager/IContent';
export declare type CreatorFn<ContentT> = (data: IContentData) => Promise<ContentT>;
export declare class ScriptLoader<ContentT extends IScrollerContent = IScrollerContent> {
    private static readonly PRELOADING_TIME;
    private _mapScroller;
    private _creatorFn;
    constructor(mapScroller: Scroller<ContentT>, creatorFn: CreatorFn<ContentT>);
    loadScript(scriptData: ScriptData): Promise<void>;
}
