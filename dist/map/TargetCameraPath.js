import { CurveInterpolator, getTtoUmapping } from 'curve-interpolator';
import { cameraOptionsFromFreeCameraOptions, getCameraFromPositionAndTarget, } from './cameraHelpers';
export class TargetCameraPath {
    constructor(map, keyFrames, opts = { tension: 0 }) {
        if (!keyFrames.length)
            throw new Error('Must have at least 1 camera position');
        this._map = map;
        this._frames = keyFrames;
        const times = keyFrames.map((k) => k.time);
        this._timeInterpolator = new CurveInterpolator(times.map((t, i) => [t, i]), { tension: 0 });
        const positions = keyFrames.map((k) => k.camera.position);
        const coords = positions.map((p) => [p.x, p.y, p.z]);
        this._positionInterpolator = new CurveInterpolator(coords, opts);
        const targets = keyFrames.map((k) => {
            const c = cameraOptionsFromFreeCameraOptions(this._map, k.camera).center;
            return [c.lng, c.lat, 0];
        });
        this._targetInterpolator = new CurveInterpolator(targets, opts);
        this._extent = [Math.min(...times), Math.max(...times)];
    }
    getCameraAtTime(time) {
        if (time <= this._extent[0])
            return this._frames[0].camera;
        if (time >= this._extent[1])
            return this._frames[this._frames.length - 1].camera;
        const t = this._timeInterpolator.lookup(time, 0, 1)[1] / (this._frames.length - 1);
        const uPos = getTtoUmapping(t, this._positionInterpolator.arcLengths);
        const position = this._positionInterpolator.getPointAt(uPos);
        const uTar = getTtoUmapping(t, this._targetInterpolator.arcLengths);
        const target = this._targetInterpolator.getPointAt(uTar);
        return getCameraFromPositionAndTarget(this._map, [position[0], position[1]], position[2], [
            target[0],
            target[1],
        ]);
    }
}
//# sourceMappingURL=TargetCameraPath.js.map