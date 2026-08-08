import { useTitle } from "../../hooks/use-title";

/**
 * Render the not-found error page.
 */
export default function Error404() {
    useTitle("Not Found (404)");

    return (
        <article className="error-page">
            <div className="wrap">
                <div className="error-image"></div>
                <h1>This page cannot be found</h1>
                <p>Check if there is a typo in the address.</p>
                <div className="error-code">HTTP_NOT_FOUND (404)</div>
            </div>
        </article>
    );
}
