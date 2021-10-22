// Copyright 2021 Marco Quaggiotto

import { IntervalTree } from 'node-interval-tree';
import { SyncEvent } from 'ts-events';

import { IContent } from './IContent';

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter((x) => !b.has(x)));
}

export class ContentManager<ContentT extends IContent = IContent> {
    public contentsChanged = new SyncEvent<ContentT[]>();
    public extentChanged = new SyncEvent<[number, number]>();

    private _position = 0;
    private _extent: [number, number] = [0, 0];
    private _intervalTree = new IntervalTree<ContentT>();
    private _currentContents: Set<ContentT> = new Set();
    private _contents: [ContentT, number | undefined][] = [];

    public addContent(content: ContentT, order?: number): void {
        content.intervalChanged.attach(this, this._onContentIntervalChanged);
        this._intervalTree.insert(content);
        this._contents.push([content, order]);
        this._sortContents();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
    }

    public removeContent(content: ContentT): void {
        const idx = this._contents.findIndex(([c, ,]) => content === c);
        if (idx === -1) return;
        this._intervalTree.remove(content);
        this._contents.splice(idx, 1);
        this._sortContents();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
    }

    public reset(): void {
        this._contents = [];
        this._intervalTree = new IntervalTree();
        this._position = 0;
        this._currentContents = new Set();
        this._extent = [0, 0];
    }

    public setPosition(position: number): void {
        this._position = position;

        const oldContents = this._currentContents;
        this._currentContents = new Set(this._intervalTree.search(position, position));
        const newContents = difference(this._currentContents, oldContents);
        const staleContents = difference(oldContents, this._currentContents);

        newContents.forEach((c) => c.setVisibility(true));
        staleContents.forEach((c) => c.setVisibility(false));
        this._currentContents.forEach((c) => c.setPosition(position));
    }

    public getPosition(): number {
        return this._position;
    }

    public getExtent(): [number, number] {
        return this._extent;
    }

    public getContents(): ContentT[] {
        return this._contents.map(([c, ,]) => c);
    }

    private _sortContents(): void {
        this._contents.sort(([, o1], [, o2]) => (o1 ?? Infinity) - (o2 ?? Infinity) || 0);
    }

    private _updateExtent(): void {
        const contents = this.getContents();
        if (contents.length) {
            const min = Math.min(...contents.map((c) => c.low));
            const max = Math.max(...contents.map((c) => c.high));
            this._extent = [min, max];
        } else {
            this._extent = [0, 0];
        }
        this.extentChanged.post(this._extent as [number, number]);
    }

    private _onContentIntervalChanged(): void {
        this._rebuildIntervalTree();
        this._updateExtent();
        this.contentsChanged.post(this.getContents());
        this.setPosition(this._position);
    }

    private _rebuildIntervalTree(): void {
        this._intervalTree = new IntervalTree();
        this._contents.forEach(([c, ,]) => this._intervalTree.insert(c));
    }
}
