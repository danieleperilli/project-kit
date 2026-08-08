import Anchor, { type AnchorProps } from "./Anchor";

interface Props extends AnchorProps {
    iconPosition?: "left" | "right";
    hasBadge?: boolean;
}

/**
 * Render a compact icon control with an optional label and badge.
 * @param props Component properties.
 */
export default function ControlIcon({ children, className, disabled, icon, iconPosition = "left", tooltip, hasBadge, routeTo, routeParams, linkTo, inNewTab, onClick }: Props) {

    return (
        <Anchor routeTo={routeTo} routeParams={routeParams} linkTo={linkTo} tooltip={tooltip} inNewTab={inNewTab} disabled={disabled} className={`ctrl-icon-container ${className ? `${className}-container` : ""}`}>
            <div
                className={`ctrl-icon ${className || ""} ${children ? "with-label" : ""} ${disabled ? "disabled" : ""}`}
                onClick={onClick}
            >
                {icon && iconPosition === "left" && <span className={`icon icon-${icon}`}></span>}
                {children}
                {icon && iconPosition === "right" && <span className={`icon icon-${icon}`}></span>}
                {hasBadge && <div className="badge"></div>}
            </div>
        </Anchor>
    );
}
