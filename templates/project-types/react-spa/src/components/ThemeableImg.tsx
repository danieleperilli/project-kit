import type { ImgHTMLAttributes } from "react";
import { useTheme } from "../hooks/use-theme";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    className?: string;
}

/**
 * Render an image whose dark-mode asset uses a `-dark` suffix.
 * @param props Component properties.
 */
export default function ThemeableImg({ src, alt, className, ...rest }: Props) {
    const { isDark } = useTheme();
    const themedSrc = isDark ? src.replace(/(\.[^.]+)$/, "-dark$1") : src;
    
    return <img src={themedSrc} alt={alt} className={className} {...rest} />;
}
