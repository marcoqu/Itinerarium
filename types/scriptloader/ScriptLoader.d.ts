import { Scroller } from '../scroller/Scroller';
import { ScriptData } from './ScriptData';
import { IContent, IContentData } from '../contentmanager/IContent';
export declare type CreatorFn<ContentT> = (data: IContentData) => Promise<ContentT>;
export declare class ScriptLoader<ContentT extends IContent = IContent> {
    private static readonly PRELOADING_TIME;
    private _mapScroller;
    private _creatorFn;
    constructor(mapScroller: Scroller<ContentT>, creatorFn: CreatorFn<ContentT>);
    loadScript(scriptData: ScriptData): Promise<void>;
}
