export declare type Q = [number, number, number, number];
export declare function slerp(t: number, w0: number, x0: number, y0: number, z0: number, w1: number, x1: number, y1: number, z1: number, d: number): Q;
export declare function squad(q0: Q, q1: Q, q2: Q, q3: Q): (t: number) => Q;
