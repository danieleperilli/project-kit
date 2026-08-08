import { useEffect, useState } from "react";
import type { ActualThemeType, ThemeType } from "../model/settings";
import { useSettingsStore } from "../store/settings";

/**
 * Manage the selected theme and keep browser chrome synchronized with the effective theme.
 */
export function useTheme() {
    const theme = useSettingsStore((state) => state.settings.theme);
    const setSettings = useSettingsStore((state) => state.setSettings);
    const [actualTheme, setActualTheme] = useState<ActualThemeType>("light");

    useEffect(() => {
        const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

        /**
         * Resolve the effective theme from the user choice and system preference.
         */
        const resolveActual = (): ActualThemeType => {
            if (theme === "dark") {
                return "dark";
            }

            if (theme === "light") {
                return "light";
            }

            return colorScheme.matches ? "dark" : "light";
        };

        /**
         * Apply the effective theme to the document and browser theme metadata.
         */
        const apply = () => {
            const resolved = resolveActual();
            const root = document.documentElement;

            root.removeAttribute("data-light");
            root.removeAttribute("data-dark");
            root.setAttribute(resolved === "dark" ? "data-dark" : "data-light", "");

            const color = getComputedStyle(root).getPropertyValue("--meta-theme-color").trim();
            let meta = document.querySelector(`meta[name="theme-color"]:not([media])`) as HTMLMetaElement | null;

            if (!meta) {
                meta = document.createElement("meta");
                meta.name = "theme-color";
                document.head.appendChild(meta);
            }

            meta.setAttribute("content", color);
            setActualTheme(resolved);
        };

        apply();

        if (theme === "system") {
            colorScheme.addEventListener("change", apply);
            return () => colorScheme.removeEventListener("change", apply);
        }
    }, [theme]);

    const isDark = actualTheme === "dark";
    const isLight = actualTheme === "light";

    /**
     * Persist a theme selection.
     * @param nextTheme Theme to select.
     */
    const setTheme = (nextTheme: ThemeType) => setSettings({ theme: nextTheme });

    /**
     * Cycle through system, light, and dark theme selections.
     */
    const cycleTheme = () => {
        const nextTheme: ThemeType = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
        setTheme(nextTheme);
    };

    return { theme, actualTheme, setTheme, cycleTheme, isDark, isLight };
}
