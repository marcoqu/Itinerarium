type Fn<argsT extends unknown[] = unknown[]> = (...args: argsT) => void;

export const rafThrottle = <argsT extends unknown[] = unknown[]>(fn: Fn<argsT>): Fn<argsT> => {
    let isRequesting = false;
    let requestedArgs: argsT;
    return (...args: argsT) => {
        requestedArgs = args;
        if (isRequesting) return;
        isRequesting = true;
        window.requestAnimationFrame(() => {
            fn(...requestedArgs);
            isRequesting = false;
        });
    };
};
