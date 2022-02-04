import { timeout } from '../utils/timeout';
export class ScriptLoader {
    constructor(mapScroller, creatorFn) {
        this._mapScroller = mapScroller;
        this._creatorFn = creatorFn;
    }
    async loadScript(scriptData) {
        this._mapScroller.reset();
        // load (and wait for) required contents
        try {
            const requiredContents = scriptData.contents
                .map((c, i) => [c, i])
                .filter(([c, ,]) => c.required);
            // DEBUG.log(`Loading required contents: ${requiredContents.length}`);
            const promises = requiredContents.map(async ([data, order]) => {
                const content = await this._creatorFn(data);
                return this._mapScroller.addContent(content, order);
            });
            await Promise.all(promises);
            // DEBUG.log('Loading required contents: done');
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        // load (and partially wait for) required contents
        try {
            const nonRequiredContents = scriptData.contents
                .map((c, i) => [c, i])
                .filter(([c, ,]) => !c.required);
            // DEBUG.log(`Loading non required contents: ${nonRequiredContents.length}`);
            const promises = nonRequiredContents.map(async ([data, order]) => {
                const content = await this._creatorFn(data);
                return this._mapScroller.addContent(content, order);
            });
            const time = scriptData.preloadingTime ?? ScriptLoader.PRELOADING_TIME;
            // await timeout(Promise.all(promises), time);
            const res = await timeout(Promise.all(promises), time);
            if (res === timeout.TIMED_OUT)
                console.log(`Loading non-required contents: timed out after ${time}ms`);
            else
                console.log('Loading non-required contents: done');
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        // set up scroll control
        if (scriptData.snapPositions)
            this._mapScroller.setSnapPositions(scriptData.snapPositions);
        if (scriptData.speed)
            this._mapScroller.setScrollOptions({ speedFactor: scriptData.speed });
    }
}
ScriptLoader.PRELOADING_TIME = 5000;
//# sourceMappingURL=ScriptLoader.js.map