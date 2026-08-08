export type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create a shallow copy without the specified keys.
 * @param object Source object.
 * @param keys Keys to omit.
 */
export function omit<T, K extends keyof T>(object: T, ...keys: K[]): OmitKeys<T, K> {
    const result = {} as Omit<T, K>;

    for (const key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key) || (keys as readonly string[]).includes(key)) {
            continue;
        }

        (result as Record<string, unknown>)[key] = object[key];
    }

    return result;
}

/**
 * Wait for a number of milliseconds.
 * @param milliseconds Delay duration.
 */
export function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
