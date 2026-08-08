export type ActualThemeType = "light" | "dark";
export type ThemeType = ActualThemeType | "system";

export interface ISettings {
    theme: ThemeType;
}

/**
 * The default application settings.
 */
export const defaultSettings: ISettings = {
    theme: "system",
};
