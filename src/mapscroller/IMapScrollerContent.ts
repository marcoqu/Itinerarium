import { SyncEvent } from 'ts-events';
import { CameraMap } from '../map/CameraMap';
import { IContent, IContentData } from '../contentmanager/IContent';
import { ViewportManager } from '../viewportmanager/ViewportManager';

export interface IMapScrollerContent<DataT extends IContentData = IContentData> extends IContent {
    seek?: SyncEvent<number>;
    init(container: HTMLElement, map: CameraMap, viewportManager: ViewportManager): this;
    setData(data: DataT): Promise<this>;
    setDestination?(destination: number): void;
}
