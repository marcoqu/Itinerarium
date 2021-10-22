// Copyright 2021 Marco Quaggiotto
import { IntervalTree } from 'node-interval-tree';
import { SyncEvent } from 'ts-events';
function difference(a, b) {
    return new Set([...a].filter((x) => !b.has(x)));
}
export class ContentManager {
    constructor() {
        this.contentsChanged = new SyncEvent();
        this.extentChanged = new SyncEvent();
        this._position = 0;
        this._extent = [0, 0];
        this._intervalTree = new IntervalTree();
        this._currentContents = new Set();
        this._contents = [];
    }
    addContent(content, order) {
        content.intervalChanged.attach(this, this._onContentIntervalChanged);
        this._intervalTree.insert(content);
        this._contents.push([content, order]);
        this._sortContents();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
    }
    removeContent(content) {
        const idx = this._contents.findIndex(([c, ,]) => content === c);
        if (idx === -1)
            return;
        this._intervalTree.remove(content);
        this._contents.splice(idx, 1);
        this._sortContents();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
    }
    reset() {
        this._contents = [];
        this._intervalTree = new IntervalTree();
        this._position = 0;
        this._currentContents = new Set();
        this._extent = [0, 0];
    }
    setPosition(position) {
        this._position = position;
        const oldContents = this._currentContents;
        this._currentContents = new Set(this._intervalTree.search(position, position));
        const newContents = difference(this._currentContents, oldContents);
        const staleContents = difference(oldContents, this._currentContents);
        newContents.forEach((c) => c.setVisibility(true));
        staleContents.forEach((c) => c.setVisibility(false));
        this._currentContents.forEach((c) => c.setPosition(position));
    }
    getPosition() {
        return this._position;
    }
    getExtent() {
        return this._extent;
    }
    getContents() {
        return this._contents.map(([c, ,]) => c);
    }
    _sortContents() {
        this._contents.sort(([, o1], [, o2]) => (o1 ?? Infinity) - (o2 ?? Infinity) || 0);
    }
    _updateExtent() {
        const contents = this.getContents();
        if (contents.length) {
            const min = Math.min(...contents.map((c) => c.low));
            const max = Math.max(...contents.map((c) => c.high));
            this._extent = [min, max];
        }
        else {
            this._extent = [0, 0];
        }
        this.extentChanged.post(this._extent);
    }
    _onContentIntervalChanged() {
        this._rebuildIntervalTree();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
        this.setPosition(this._position);
    }
    _rebuildIntervalTree() {
        this._intervalTree = new IntervalTree();
        this._contents.forEach(([c, ,]) => this._intervalTree.insert(c));
    }
}
//# sourceMappingURL=ContentManager.js.map