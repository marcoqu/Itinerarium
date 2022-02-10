import { Map } from 'mapbox-gl';
import { FreeCameraPosition } from './cameraHelpers';
import { CurveInterpolatorOptions } from 'curve-interpolator/dist/src/curve-interpolator';
export declare type KeyFrame = {
    time: number;
    camera: FreeCameraPosition;
};
export declare class TargetCameraPath {
    private _frames;
    private _extent;
    private _positionInterpolator;
    private _timeInterpolator;
    private _map;
    private _targetInterpolator;
    constructor(map: Map, keyFrames: KeyFrame[], opts?: CurveInterpolatorOptions);
    getCameraAtTime(time: number): FreeCameraPosition;
}
