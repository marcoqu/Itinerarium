import { IContentData } from '../contentmanager/IContent';
export declare type ScriptData = {
    speed?: number;
    mapStyle?: string;
    preloadingTime?: number;
    snapPositions?: number[];
    contents: IContentData[];
};
