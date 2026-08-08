import Anchor, { type AnchorProps } from "./Anchor";

type ButtonType = "primary" | "alt" | "invert" | "del" | "text";

export interface ButtonProps extends AnchorProps {
    text?: string;
    variant?: ButtonType;
}

/**
 * Render an application button using the shared anchor behavior.
 * @param props Component properties.
 */
export default function Button({ icon, className, text, onClick, routeTo, routeParams, linkTo, children, disabled, tooltip, variant, ...rest }: ButtonProps) {
    const classNames = `button ${variant ? `button-${variant} ${className || ""}` : ""} ${icon && !text && !children ? "icon-only" : ""} ${disabled ? "disabled" : ""}`;

    return (
        <Anchor routeTo={routeTo} routeParams={routeParams} linkTo={linkTo} tooltip={tooltip} onClick={onClick} disabled={disabled} {...rest}>
            <div className={classNames}>
                {icon && <span className={`icon icon-${icon}`}></span>}
                {text && <span className="text">{text}</span>}
                {children}
            </div>
        </Anchor>
    );
}
