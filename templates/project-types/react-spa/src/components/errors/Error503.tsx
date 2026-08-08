import { useTitle } from "../../hooks/use-title";

/**
 * Render the service-unavailable error page.
 */
export default function Error503() {
    useTitle("Maintenance (503)");

    return (
        <article className="error-page error503">
            <div className="wrap">
                <div className="error-image"></div>
                <h1>Server under maintenance</h1>
                <p>Hang tight, we will be back online soon.</p>
                <div className="error-code">HTTP_SERVICE_UNAVAILABLE (503)</div>
            </div>
        </article>
    );
}
