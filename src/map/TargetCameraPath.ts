import { LngLat, Map } from 'mapbox-gl';
import { CurveInterpolator, getTtoUmapping } from 'curve-interpolator';
import { CurveInterpolatorOptions } from 'curve-interpolator/dist/src/curve-interpolator';

import {
    cameraOptionsFromFreeCameraOptions,
    FreeCameraPosition,
    getCameraFromPositionAndTarget,
} from './cameraHelpers';

export type KeyFrame = {
    time: number;
    camera: FreeCameraPosition;
};

export class TargetCameraPath {
    private _frames: KeyFrame[];
    private _extent: [number, number];
    private _positionInterpolator: CurveInterpolator;
    private _timeInterpolator: CurveInterpolator;
    private _map: Map;
    private _targetInterpolator: CurveInterpolator;

    public constructor(map: Map, keyFrames: KeyFrame[], opts: CurveInterpolatorOptions = { tension: 0 }) {
        if (!keyFrames.length) throw new Error('Must have at least 1 camera position');
        this._map = map;
        this._frames = keyFrames;

        const times = keyFrames.map((k) => k.time);
        this._timeInterpolator = new CurveInterpolator(
            times.map((t, i) => [t, i]),
            { tension: 0 },
        );

        const positions = keyFrames.map((k) => k.camera.position);
        const coords = positions.map((p) => [...p.toLngLat().toArray(), p.toAltitude()] as [number, number, number]);
        this._positionInterpolator = new CurveInterpolator(coords, opts);

        const targets = keyFrames.map((k) => {
            const c = cameraOptionsFromFreeCameraOptions(this._map, k.camera).center as LngLat;
            return [c.lng, c.lat, 0];
        });
        this._targetInterpolator = new CurveInterpolator(targets, opts);

        this._extent = [Math.min(...times), Math.max(...times)];
    }

    public getCameraAtTime(time: number): FreeCameraPosition {
        if (time <= this._extent[0]) return this._frames[0].camera;
        if (time >= this._extent[1]) return this._frames[this._frames.length - 1].camera;

        const t = (this._timeInterpolator.lookup(time, 0, 1)[1] as number) / (this._frames.length - 1);
        const uPos = getTtoUmapping(t, this._positionInterpolator.arcLengths);
        const cameraPosition = this._positionInterpolator.getPointAt(uPos);
        const cameraLngLat = [cameraPosition[0], cameraPosition[1]] as [number, number];
        const cameraAltitude = cameraPosition[2] as number;

        const uTar = getTtoUmapping(t, this._targetInterpolator.arcLengths);
        const targetPosition = this._targetInterpolator.getPointAt(uTar);
        const targetLngLat = [targetPosition[0], targetPosition[1]] as [number, number];

        return getCameraFromPositionAndTarget(this._map, cameraLngLat, cameraAltitude, targetLngLat);
    }
}
