import { MapScroller } from '../mapscroller/MapScroller';
import { IMapScrollerContent } from '../mapscroller/IMapScrollerContent';
import { ScriptData } from './ScriptData';
import { IContentData } from '../contentmanager/IContent';
export declare type CreatorFn<ContentT> = (data: IContentData) => Promise<ContentT>;
export declare class ScriptLoader<ContentT extends IMapScrollerContent = IMapScrollerContent> {
    private static readonly PRELOADING_TIME;
    private _mapScroller;
    private _creatorFn;
    constructor(mapScroller: MapScroller<ContentT>, creatorFn: CreatorFn<ContentT>);
    loadScript(scriptData: ScriptData): Promise<void>;
}
