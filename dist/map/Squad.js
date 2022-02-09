// Spherical quadrangle interpolation
// ----------------------------------------------------------
// TypeScript port from Lua
// Copyright (c) 2019 Parker Stebbins
// Distributed under the MIT license
// github.com/Fraktality/squad
const abs = Math.abs;
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const atan2 = Math.atan2;
// log(q0*inv(q1))
function invLogProduct(w0, x0, y0, z0, w1, x1, y1, z1) {
    const w = w0 * w1 + x0 * x1 + y0 * y1 + z0 * z1;
    const x = w0 * x1 - x0 * w1 + y0 * z1 - z0 * y1;
    const y = w0 * y1 - x0 * z1 - y0 * w1 + z0 * x1;
    const z = w0 * z1 + x0 * y1 - y0 * x1 - z0 * w1;
    const v = sqrt(x * x + y * y + z * z);
    const t = v > 1e-4 ? atan2(v, w) / (4 * v) : 8 / 21 + w * (-27 / 140 + w * (8 / 105 - w / 70));
    return [x * t, y * t, z * t];
}
// generate a control rotation from three quats
function controlRotation(w0, x0, y0, z0, w1, x1, y1, z1, w2, x2, y2, z2) {
    if (w0 * w1 + x0 * x1 + y0 * y1 + z0 * z1 < 0) {
        [w0, x0, y0, z0] = [-w0, -x0, -y0, -z0];
    }
    if (w2 * w1 + x2 * x1 + y2 * y1 + z2 * z1 < 0) {
        [w2, x2, y2, z2] = [-w2, -x2, -y2, -z2];
    }
    const [bx0, by0, bz0] = invLogProduct(w0, x0, y0, z0, w1, x1, y1, z1);
    const [bx1, by1, bz1] = invLogProduct(w2, x2, y2, z2, w1, x1, y1, z1);
    const mx = bx0 + bx1;
    const my = by0 + by1;
    const mz = bz0 + bz1;
    const n = sqrt(mx * mx + my * my + mz * mz);
    const m = n > 1e-4 ? sin(n) / n : 1 + n * n * ((n * n) / 120 - 1 / 6);
    const ew = cos(n);
    const ex = m * mx;
    const ey = m * my;
    const ez = m * mz;
    return [
        ew * w1 - ex * x1 - ey * y1 - ez * z1,
        ex * w1 + ew * x1 - ez * y1 + ey * z1,
        ey * w1 + ez * x1 + ew * y1 - ex * z1,
        ez * w1 - ey * x1 + ex * y1 + ew * z1,
    ];
}
export function slerp(t, x0, y0, z0, w0, x1, y1, z1, w1, d) {
    let t0, t1;
    if (d < 0.9999) {
        const d0 = y0 * x1 + w0 * z1 - x0 * y1 - z0 * w1;
        const d1 = y0 * w1 - w0 * y1 + z0 * x1 - x0 * z1;
        const d2 = y0 * z1 - w0 * x1 - z0 * y1 + x0 * w1;
        const theta = atan2(sqrt(d0 * d0 + d1 * d1 + d2 * d2), d);
        const rsa = sqrt(1 - d * d);
        [t0, t1] = [sin((1 - t) * theta) / rsa, sin(t * theta) / rsa];
    }
    else {
        [t0, t1] = [1 - t, t];
    }
    return [x0 * t0 + x1 * t1, y0 * t0 + y1 * t1, z0 * t0 + z1 * t1, w0 * t0 + w1 * t1];
}
export function squad(q0, q1, q2, q3) {
    const [q1x, q1y, q1z, q1w] = [q1[0], q1[1], q1[2], q1[3]];
    let [q2x, q2y, q2z, q2w] = [q2[0], q2[1], q2[2], q2[3]];
    const [p0w, p0x, p0y, p0z] = controlRotation(q0[0], q0[1], q0[2], q0[3], q1w, q1x, q1y, q1z, q2w, q2x, q2y, q2z);
    let [p1w, p1x, p1y, p1z] = controlRotation(q1w, q1x, q1y, q1z, q2w, q2x, q2y, q2z, q3[0], q3[1], q3[2], q3[3]);
    let dq = q1w * q2w + q1x * q2x + q1y * q2y + q1z * q2z;
    const dp = abs(p0w * p1w + p0x * p1x + p0y * p1y + p0z * p1z);
    if (dq < 0) {
        [p1w, p1x, p1y, p1z] = [-p1w, -p1x, -p1y, -p1z];
        [q2w, q2x, q2y, q2z] = [-q2w, -q2x, -q2y, -q2z];
        dq = -dq;
    }
    return function (t) {
        const [x0, y0, z0, w0] = slerp(t, q1x, q1y, q1z, q1w, q2x, q2y, q2z, dq, q2w);
        const [x1, y1, z1, w1] = slerp(t, p0x, p0y, p0z, p0w, p1x, p1y, p1z, dp, p1w);
        return slerp(2 * t * (1 - t), w0, x0, y0, z0, w1, x1, y1, z1, w0 * w1 + x0 * x1 + y0 * y1 + z0 * z1);
    };
}
//# sourceMappingURL=Squad.js.map