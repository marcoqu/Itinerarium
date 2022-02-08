import { FreeCameraOptions, MercatorCoordinate } from 'mapbox-gl';
import { CurveInterpolator } from 'curve-interpolator';
import { SquadInterpolator } from './SquadInterpolator';
export class CameraPath {
    constructor(keyFrames) {
        if (!keyFrames.length)
            throw new Error('Must have at least 1 camera position');
        this._frames = keyFrames;
        const times = keyFrames.map((k) => k.time);
        this._timeInterpolator = new CurveInterpolator(times.map((t, i) => [t, i]));
        const positions = keyFrames.map((k) => k.camera.position);
        this._positionInterpolator = new CurveInterpolator(positions.map((p) => [p.x, p.y, p.z]));
        const quaternions = keyFrames.map((k) => k.camera.orientation);
        this._squadInterpolator = new SquadInterpolator(quaternions);
        this._extent = [Math.min(...times), Math.max(...times)];
    }
    getCameraAtTime(time) {
        if (time <= this._extent[0])
            return this._frames[0].camera;
        if (time >= this._extent[1])
            return this._frames[this._frames.length - 1].camera;
        const t = this._timeInterpolator.lookup(time, 0, 1)[1] / (this._frames.length - 1);
        const position = this._positionInterpolator.getPointAt(t);
        const orientation = this._squadInterpolator.getQuaternionAt(t);
        return new FreeCameraOptions(new MercatorCoordinate(...position), orientation);
    }
}
//# sourceMappingURL=CameraPath.js.map