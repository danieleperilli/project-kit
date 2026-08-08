import { Tooltip } from "radix-ui";
import { NavLink } from "react-router-dom";
import { getRouteUrl, type RouteKey } from "../model/routes";

export interface AnchorProps {
    className?: string;
    isCtA?: boolean;
    isInvertedCtA?: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    routeTo?: RouteKey;
    routeParams?: string[];
    routeHash?: string;
    linkTo?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    icon?: string;
    tooltip?: string;
    inNewTab?: boolean;
}

/**
 * Render an internal route, external link, or non-link wrapper with optional tooltip styling.
 * @param props Component properties.
 */
export default function Anchor({ className, isCtA, isInvertedCtA, onClick, routeTo, routeParams, routeHash, linkTo, children, disabled, icon, tooltip, inNewTab, ...rest }: AnchorProps) {
    const classNames = `${isCtA ? "cta " : isInvertedCtA ? "atc" : ""} ${className || ""} ${disabled ? "disabled" : ""} ${icon ? `icon-${icon}` : ""}`.trim();
    const onClickHandler = onClick && !disabled ? onClick : undefined;
    let link: React.ReactNode;

    if (routeTo) {
        link = (
            <NavLink to={{ pathname: getRouteUrl(routeTo, ...(routeParams ?? [])), hash: routeHash }} className={classNames} onClick={onClickHandler} {...rest}>
                {children}
            </NavLink>
        );
    } else if (linkTo) {
        link = (
            <a href={linkTo} className={classNames} target={inNewTab ? "_blank" : undefined} rel={inNewTab ? "noopener noreferrer" : undefined} onClick={onClickHandler} {...rest}>
                {children}
            </a>
        );
    } else {
        link = <span className={classNames} onClick={onClickHandler}>{children}</span>;
    }

    return tooltip ? (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                {link}
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content className="tooltip-content">
                    {tooltip}
                    <Tooltip.Arrow className="tooltip-arrow" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    ) : link;
}
