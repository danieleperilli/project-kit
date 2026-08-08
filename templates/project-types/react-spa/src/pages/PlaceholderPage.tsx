import { useTitle } from "../hooks/use-title";

/**
 * Render a provisional page for routes that are not implemented yet.
 */
export default function PlaceholderPage() {
    useTitle("Not yet ready");

    return (
        <article className="page-error drafting">
            <div className="back-error vmiddle">
                <p className="error-desc">
                    Sorry, we are still finalizing this page. Come back later to check it out!
                </p>
            </div>
        </article>
    );
}
