import { useEffect } from "react";
import { type FallbackProps } from "react-error-boundary";
import { toProblem } from "../../model/problem";
import ErrorPage from "../../pages/ErrorPage";

/**
 * Render a safe fallback for uncaught React rendering errors.
 * @param props Error-boundary fallback properties.
 */
export default function ScriptError({ error }: FallbackProps) {
    const problem = toProblem(error);
    const statusCode = problem.details.httpStatus || 500;
    const isAuthProblem = [401, 403, 419].includes(statusCode);

    useEffect(() => {
        console.error(`Unhandled application error (${statusCode})`);
    }, [statusCode]);

    if (statusCode === 404) {
        return <ErrorPage />;
    }

    const icon = isAuthProblem ? "lock" : "warning-octagon";
    const defaultMessage = isAuthProblem ? "It looks like you are not authorized to access this resource." : "There was an error loading this page. Please retry later.";

    return (
        <div className="script-error">
            <h1 className={`icon icon-${icon}`}>Oops</h1>
            <p>{problem.message || defaultMessage}</p>
            {problem.details.code && <p className="note">{problem.details.code}</p>}
        </div>
    );
}
