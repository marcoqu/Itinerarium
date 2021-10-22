import { SyncEvent } from 'ts-events';
import { IContent } from './IContent';
export declare class ContentManager<ContentT extends IContent = IContent> {
    contentsChanged: SyncEvent<ContentT[]>;
    extentChanged: SyncEvent<[number, number]>;
    private _position;
    private _extent;
    private _intervalTree;
    private _currentContents;
    private _contents;
    addContent(content: ContentT, order?: number): void;
    removeContent(content: ContentT): void;
    reset(): void;
    setPosition(position: number): void;
    getPosition(): number;
    getExtent(): [number, number];
    getContents(): ContentT[];
    private _sortContents;
    private _updateExtent;
    private _onContentIntervalChanged;
    private _rebuildIntervalTree;
}
