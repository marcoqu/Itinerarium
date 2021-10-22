export function timeout(p, time, withError = false) {
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => (withError ? reject("Time's up!") : resolve(timeout.TIMED_OUT)), time);
    });
    return Promise.race([p, timeoutPromise]);
}
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (timeout) {
    timeout.TIMED_OUT = Symbol('Timed out');
})(timeout || (timeout = {}));
//# sourceMappingURL=timeout.js.map