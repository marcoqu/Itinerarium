import { Scroller } from '../scroller/Scroller';
import { IScrollerContent } from '../scroller/IScrollerContent';
import { ScriptData } from './ScriptData';
import { timeout } from '../utils/timeout';
import { IContentData } from '../contentmanager/IContent';

export type CreatorFn<ContentT> = (data: IContentData) => Promise<ContentT>;

export class ScriptLoader<ContentT extends IScrollerContent = IScrollerContent> {
    private static readonly PRELOADING_TIME = 5000;
    private _mapScroller: Scroller<ContentT>;
    private _creatorFn: CreatorFn<ContentT>;

    public constructor(mapScroller: Scroller<ContentT>, creatorFn: CreatorFn<ContentT>) {
        this._mapScroller = mapScroller;
        this._creatorFn = creatorFn;
    }

    public async loadScript(scriptData: ScriptData): Promise<void> {
        this._mapScroller.reset();

        // load (and wait for) required contents
        try {
            const requiredContents = scriptData.contents
                .map((c, i) => [c, i] as [IContentData, number])
                .filter(([c, ,]) => c.required);
            // DEBUG.log(`Loading required contents: ${requiredContents.length}`);
            const promises = requiredContents.map(async ([data, order]) => {
                const content = await this._creatorFn(data);
                return this._mapScroller.addContent(content, order);
            });
            await Promise.all(promises);
            // DEBUG.log('Loading required contents: done');
        } catch (error) {
            console.log(error);
            throw error;
        }

        // load (and partially wait for) required contents
        try {
            const nonRequiredContents = scriptData.contents
                .map((c, i) => [c, i] as [IContentData, number])
                .filter(([c, ,]) => !c.required);
            // DEBUG.log(`Loading non required contents: ${nonRequiredContents.length}`);
            const promises = nonRequiredContents.map(async ([data, order]) => {
                const content = await this._creatorFn(data);
                return this._mapScroller.addContent(content, order);
            });
            const time = scriptData.preloadingTime ?? ScriptLoader.PRELOADING_TIME;
            // await timeout(Promise.all(promises), time);
            const res = await timeout(Promise.all(promises), time);
            if (res === timeout.TIMED_OUT) console.log(`Loading non-required contents: timed out after ${time}ms`);
            else console.log('Loading non-required contents: done');
        } catch (error) {
            console.log(error);
            throw error;
        }

        // set up scroll control
        if (scriptData.snapPositions) this._mapScroller.setSnapPositions(scriptData.snapPositions);
        if (scriptData.speed) this._mapScroller.setScrollOptions({ speedFactor: scriptData.speed });
    }
}
