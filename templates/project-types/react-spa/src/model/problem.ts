const DEFAULT_PROBLEM_CODE = "SCRIPT_ERROR";

export interface IProblemDetails {
    code: string;
    time?: number;
    origin?: string;
    httpStatus?: number;
    source?: string;
    context?: Record<string, unknown>;
    cause?: unknown;
}

export class Problem extends Error {
    readonly details: IProblemDetails;

    /**
     * Create a normalized application problem.
     * @param message Human-readable error message.
     * @param details Structured diagnostic details.
     */
    constructor(message: string, details?: IProblemDetails) {
        super(message);

        this.details = {
            ...details,
            code: (details?.code ?? DEFAULT_PROBLEM_CODE).toUpperCase(),
            time: details?.time ?? Date.now()
        };
    }
}

/**
 * Check whether an unknown value is an Error instance.
 * @param error Value to inspect.
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Check whether an unknown value is an application Problem.
 * @param problem Value to inspect.
 */
export function isProblem(problem: unknown): problem is Problem {
    return problem instanceof Problem;
}

/**
 * Convert an unknown error value into a normalized application problem.
 * @param error Value to normalize.
 * @param defaultDetails Details to use when the source does not provide them.
 */
export function toProblem(error: unknown, defaultDetails?: IProblemDetails): Problem {
    if (isProblem(error)) {
        return error;
    }

    const message = isError(error) ? error.message : String(error);

    return new Problem(message, {
        ...defaultDetails,
        code: defaultDetails?.code ?? DEFAULT_PROBLEM_CODE,
        ...(isError(error) ? { cause: error } : {})
    });
}
