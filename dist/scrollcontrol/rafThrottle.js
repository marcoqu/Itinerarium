export const rafThrottle = (fn) => {
    let isRequesting = false;
    let requestedArgs;
    return (...args) => {
        requestedArgs = args;
        if (isRequesting)
            return;
        isRequesting = true;
        window.requestAnimationFrame(() => {
            fn(...requestedArgs);
            isRequesting = false;
        });
    };
};
//# sourceMappingURL=rafThrottle.js.map