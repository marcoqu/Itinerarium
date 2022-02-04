import { SyncEvent } from 'ts-events';
import { IContent } from '../contentmanager/IContent';

export interface IScrollerContent extends IContent {
    seek?: SyncEvent<number>;
    destroy?(): void;
    setDestination?(destination: number): void;
}
