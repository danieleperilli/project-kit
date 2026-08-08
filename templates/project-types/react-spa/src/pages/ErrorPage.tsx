import { useEffect } from "react";
import Error404 from "../components/errors/Error404";
import Error500 from "../components/errors/Error500";
import Error503 from "../components/errors/Error503";
import { type ErrorCode } from "../model/error";

interface Props {
    code?: ErrorCode;
}

/**
 * Render the static error page associated with an HTTP-style error code.
 * @param props Component properties.
 */
export default function ErrorPage({ code = "404" }: Props) {
    useEffect(() => {
        window.history.status = code;
        window.__STATIC_STATUS__ = code;
    }, [code]);

    switch (code) {
        case "500":
            return <Error500 />;
        case "503":
            return <Error503 />;
        case "404":
        default:
            return <Error404 />;
    }
}
