import { Tooltip } from "radix-ui";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes } from "react-router-dom";
import "./style/main.scss";
import ScriptError from "./components/errors/ScriptError";
import { useTheme } from "./hooks/use-theme";
import { getRoutePage, getRoutePath, type RouteKey } from "./model/routes";
import ErrorPage from "./pages/ErrorPage";
import { ROUTES } from "./routes-config";

/**
 * Render the application routes and global error boundaries.
 */
export default function App() {
    const [appError] = useState(() => window.APP_ERROR);

    useTheme();

    if (appError) {
        return <ErrorPage code={appError} />;
    }

    return (
        <Tooltip.Provider delayDuration={500} skipDelayDuration={300}>
            <ErrorBoundary FallbackComponent={ScriptError} resetKeys={[window.location.pathname]}>
                <Routes>
                    {Object.keys(ROUTES).map((key) => (
                        <Route key={key} path={getRoutePath(key as RouteKey)} element={getRoutePage(key as RouteKey)} />
                    ))}
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </ErrorBoundary>
        </Tooltip.Provider>
    );
}
