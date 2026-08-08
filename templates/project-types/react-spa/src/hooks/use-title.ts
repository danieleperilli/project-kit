import { useEffect } from "react";
import { APP_NAME } from "../constants";

/**
 * Synchronize the document title with the current page title.
 * @param title Page title.
 * @param suffix Application suffix appended to non-root titles.
 */
export function useTitle(title?: string, suffix = APP_NAME) {
    useEffect(() => {
        if (title === null || title === undefined) {
            return;
        }

        document.title = title ? `${title}${suffix && title !== suffix ? ` - ${suffix}` : ""}` : suffix;
    }, [suffix, title]);
}
