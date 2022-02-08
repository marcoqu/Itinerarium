import { FreeCameraOptions, MercatorCoordinate } from 'mapbox-gl';
import { Q } from './Squad';
export declare type KeyFrame = {
    time: number;
    camera: FreeCameraOptions & {
        orientation: Q;
        position: Required<MercatorCoordinate>;
    };
};
export declare class CameraPath {
    private _frames;
    private _extent;
    private _positionInterpolator;
    private _squadInterpolator;
    private _timeInterpolator;
    constructor(keyFrames: KeyFrame[]);
    getCameraAtTime(time: number): FreeCameraOptions;
}
