import { type ReactNode } from "react";
import FrontPage from "../pages/FrontPage";
import PlaceholderPage from "../pages/PlaceholderPage";
import { ROUTES } from "../routes-config";

export type RouteKey = keyof typeof ROUTES;

/**
 * Pages associated with application routes.
 */
export const ROUTE_PAGES: Record<RouteKey, ReactNode> = {
    front: <FrontPage />
};

/**
 * Check whether a string is a valid route key.
 * @param key Candidate route key.
 */
export function isRouteKey(key: string): key is RouteKey {
    return key in ROUTES;
}

/**
 * Build the URL for a route and encode its dynamic path parameters.
 * @param routeKey Route identifier.
 * @param params Dynamic path parameters.
 */
export function getRouteUrl(routeKey: RouteKey, ...params: string[]): string {
    let routePath: string = ROUTES[routeKey];
    const pathParts = routePath.split("/").filter((part) => part.startsWith(":"));

    params.forEach((param, index) => {
        routePath = routePath.replace(pathParts[index], encodeURIComponent(param));
    });

    return routePath;
}

/**
 * Find the route key associated with an exact path.
 * @param routePath Path to inspect.
 */
export function getRouteKey(routePath: string): RouteKey | undefined {
    return Object.keys(ROUTES).find((key) => routePath === ROUTES[key as RouteKey]) as RouteKey | undefined;
}

/**
 * Get the configured path for a route.
 * @param key Route identifier.
 */
export function getRoutePath(key: RouteKey): string {
    return ROUTES[key];
}

/**
 * Get the page associated with a route.
 * @param key Route identifier.
 */
export function getRoutePage(key: RouteKey): ReactNode {
    return ROUTE_PAGES[key] || <PlaceholderPage />;
}
