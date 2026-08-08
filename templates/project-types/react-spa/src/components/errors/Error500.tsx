import { useTitle } from "../../hooks/use-title";

/**
 * Render the internal-server-error page.
 */
export default function Error500() {
    useTitle("Internal Server Error (500)");

    return (
        <article className="error-page error500">
            <div className="wrap">
                <div className="error-image"></div>
                <h1>Internal Server Error</h1>
                <p>Uh oh, something went wrong.</p>
                <div className="error-code">HTTP_INTERNAL_SERVER_ERROR (500)</div>
            </div>
        </article>
    );
}
