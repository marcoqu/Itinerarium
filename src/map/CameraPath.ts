import { FreeCameraOptions, MercatorCoordinate } from 'mapbox-gl';
import { CurveInterpolator } from 'curve-interpolator';
import { SquadInterpolator } from './SquadInterpolator';
import { Q } from './Squad';

export type KeyFrame = {
    time: number;
    camera: FreeCameraOptions & { orientation: Q; position: Required<MercatorCoordinate> };
};

export class CameraPath {
    private _frames: KeyFrame[];
    private _extent: [number, number];
    private _positionInterpolator: CurveInterpolator;
    private _squadInterpolator: SquadInterpolator;
    private _timeInterpolator: CurveInterpolator;

    public constructor(keyFrames: KeyFrame[]) {
        if (!keyFrames.length) throw new Error('Must have at least 1 camera position');
        this._frames = keyFrames;

        const times = keyFrames.map((k) => k.time);
        this._timeInterpolator = new CurveInterpolator(times.map((t, i) => [t, i]));

        const positions = keyFrames.map((k) => k.camera.position);
        this._positionInterpolator = new CurveInterpolator(positions.map((p) => [p.x, p.y, p.z]));

        const quaternions = keyFrames.map((k) => k.camera.orientation);
        this._squadInterpolator = new SquadInterpolator(quaternions);

        this._extent = [Math.min(...times), Math.max(...times)];
    }

    public getCameraAtTime(time: number): FreeCameraOptions {
        if (time <= this._extent[0]) return this._frames[0].camera;
        if (time >= this._extent[1]) return this._frames[this._frames.length - 1].camera;

        const t = (this._timeInterpolator.lookup(time, 0, 1)[1] as number) / (this._frames.length - 1);
        const position = this._positionInterpolator.getPointAt(t) as [number, number, number];
        const orientation = this._squadInterpolator.getQuaternionAt(t);
        return new FreeCameraOptions(new MercatorCoordinate(...position), orientation);
    }
}
