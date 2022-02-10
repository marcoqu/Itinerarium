import { FreeCameraOptions, MercatorCoordinate } from 'mapbox-gl';
import { CurveInterpolator, getTtoUmapping } from 'curve-interpolator';
import { SquadInterpolator } from './SquadInterpolator';
import { FreeCameraPosition } from './cameraHelpers';
import { CurveInterpolatorOptions } from 'curve-interpolator/dist/src/curve-interpolator';

export type KeyFrame = {
    time: number;
    camera: FreeCameraPosition;
};

export class CameraPath {
    private _frames: KeyFrame[];
    private _extent: [number, number];
    private _positionInterpolator: CurveInterpolator;
    private _squadInterpolator: SquadInterpolator;
    private _timeInterpolator: CurveInterpolator;

    public constructor(keyFrames: KeyFrame[], opts: CurveInterpolatorOptions = { tension: 0 }) {
        if (!keyFrames.length) throw new Error('Must have at least 1 camera position');
        this._frames = keyFrames;

        const times = keyFrames.map((k) => k.time);
        this._timeInterpolator = new CurveInterpolator(
            times.map((t, i) => [t, i]),
            { tension: 0 },
        );

        const positions = keyFrames.map((k) => k.camera.position);
        const coords = positions.map((p) => [p.x, p.y, p.z] as [number, number, number]);
        this._positionInterpolator = new CurveInterpolator(coords, opts);

        const quaternions = keyFrames.map((k) => k.camera.orientation);
        this._squadInterpolator = new SquadInterpolator(quaternions);

        this._extent = [Math.min(...times), Math.max(...times)];
    }

    public getCameraAtTime(time: number): FreeCameraPosition {
        if (time <= this._extent[0]) return this._frames[0].camera;
        if (time >= this._extent[1]) return this._frames[this._frames.length - 1].camera;

        const t = (this._timeInterpolator.lookup(time, 0, 1)[1] as number) / (this._frames.length - 1);
        const u = getTtoUmapping(t, this._positionInterpolator.arcLengths);
        const position = this._positionInterpolator.getPointAt(u) as [number, number, number];
        const orientation = this._squadInterpolator.getQuaternionAt(t);
        return new FreeCameraOptions(new MercatorCoordinate(...position), orientation) as FreeCameraPosition;
    }
}
