import type { ReactNode } from "react";

interface Props {
    icon: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Render an icon from the bundled icon font.
 * @param props Component properties.
 */
export default function Icon({ icon, className, children }: Props) {
    return (
        <div className={`icon icon-${icon} ${className || ""}`}>{children}</div>
    );
}
