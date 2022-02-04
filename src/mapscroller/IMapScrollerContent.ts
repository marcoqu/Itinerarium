import { SyncEvent } from 'ts-events';
import { MapCamera } from '../map/MapCamera';
import { IContent, IContentData } from '../contentmanager/IContent';
import { ViewportManager } from '../viewportmanager/ViewportManager';

export interface IMapScrollerContentConstructor<DataT extends IContentData = IContentData> {
    new (data: DataT): IMapScrollerContent<DataT>;
}

export interface IMapScrollerContent<DataT extends IContentData = IContentData> extends IContent {
    seek?: SyncEvent<number>;
    init(container: HTMLElement, mapCamera: MapCamera, viewportManager: ViewportManager): Promise<this>;
    setData(data: DataT): Promise<this>;
    setDestination?(destination: number): void;
}
