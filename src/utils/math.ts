export function wrap(value: number, min: number, max: number): number {
    return ((((value - min) % (max - min)) + (max - min)) % (max - min)) + min;
}

export function toDegrees(radians: number): number {
    return radians / (Math.PI / 180);
}

export function clamp(n: number, min: number, max: number, warn: boolean | string = false): number {
    if (warn && (n < min || n > max)) {
        const label = typeof warn === 'boolean' ? '' : warn + ':';
        console.warn(`${label}${n} clamped to ${Math.min(max, Math.max(min, n))} (${min}, ${max})`);
    }
    return [min, n, max].sort((a, b) => a - b)[1];
}
