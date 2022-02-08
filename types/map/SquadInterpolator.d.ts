import { Q } from './Squad';
export declare class SquadInterpolator {
    private _quats;
    private _squads;
    private _length;
    constructor(quaternions: Q[]);
    private _getExtendedQuat;
    getQuaternionAt(t: number): Q;
}
