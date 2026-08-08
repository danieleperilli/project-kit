import { useTheme } from "../hooks/use-theme";
import ControlIcon from "./ControlIcon";

/**
 * Render a control that cycles through system, light, and dark themes.
 */
export default function ThemeToggle() {
    const { theme, cycleTheme } = useTheme();
    const icon = theme === "system" ? "monitor" : theme === "dark" ? "moon" : "sun";

    return (
        <ControlIcon icon={icon} tooltip="Switch Theme" className="theme-toggle" onClick={cycleTheme} />
    );
}
