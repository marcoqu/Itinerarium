export function wrap(value, min, max) {
    return ((((value - min) % (max - min)) + (max - min)) % (max - min)) + min;
}
export function toDegrees(radians) {
    return radians / (Math.PI / 180);
}
export function clamp(n, min, max, warn = false) {
    if (warn && (n < min || n > max)) {
        const label = typeof warn === 'boolean' ? '' : warn + ':';
        console.warn(`${label}${n} clamped to ${Math.min(max, Math.max(min, n))} (${min}, ${max})`);
    }
    return [min, n, max].sort((a, b) => a - b)[1];
}
//# sourceMappingURL=math.js.map