import { APP_NAME, APP_VERSION } from "../constants";
import { useTitle } from "../hooks/use-title";

/**
 * Render the starter front page.
 */
export default function FrontPage() {
    useTitle(APP_NAME);

    return (
        <article className="page page-front">
            {APP_NAME} {APP_VERSION}
        </article>
    );
}
