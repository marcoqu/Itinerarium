export function timeThrottle(fn, wait) {
    let isCalled = false;
    let lastResult;
    return function (...args) {
        if (!isCalled) {
            lastResult = fn(...args);
            isCalled = true;
            setTimeout(() => (isCalled = false), wait);
        }
        return lastResult;
    };
}
export function rafThrottle(fn) {
    let isCalled = false;
    let lastResult;
    return function (...args) {
        if (!isCalled) {
            lastResult = fn(...args);
            isCalled = true;
            window.requestAnimationFrame(() => (isCalled = false));
        }
        return lastResult;
    };
}
//# sourceMappingURL=throttle.js.map