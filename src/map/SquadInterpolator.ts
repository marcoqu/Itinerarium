import { Q, slerp, squad } from './Squad';

export class SquadInterpolator {
    private _quats: Q[];
    private _squads: Array<(t: number) => Q> = [];
    private _length: number;

    constructor(quaternions: Q[]) {
        if (quaternions.length < 2) throw new Error('SquadInterpolator requires at least 2 quaternions');
        this._quats = quaternions;
        this._length = this._quats.length;
        this._quats.unshift(this._getExtendedQuat(this._quats[1], this._quats[0]));
        this._quats.push(this._getExtendedQuat(this._quats[this._length - 2], this._quats[this._length - 1]));
        for (let i = 0; i < this._length - 1; i++) {
            const sq = squad(this._quats[i], this._quats[i + 1], this._quats[i + 2], this._quats[i + 3]);
            this._squads.push(sq);
        }
    }

    private _getExtendedQuat(q0: Q, q1: Q): Q {
        const dot = q0[0] * q1[0] + q0[1] * q1[1] + q0[2] * q1[2] + q0[3] * q1[3];
        return slerp(2, ...q0, ...q1, dot);
    }

    // Position from 0 to 1
    public getQuaternionAt(t: number): Q {
        if (t === 1) return this._quats[this._quats.length - 2];
        t = t * (this._length - 1);
        const i = Math.floor(t);
        const j = t - i;
        return this._squads[i](j);
    }
}
