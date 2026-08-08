import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSettings, type ISettings } from "../model/settings";

export interface ISettingsState {
    settings: ISettings;
    setSettings: (settings: Partial<ISettings>) => void;
    clear: () => void;
}

export const useSettingsStore = create<ISettingsState>()(
    persist(
        (set, get) => ({
            settings: defaultSettings,

            /**
             * Merge partial settings into the current settings.
             * @param settings Settings to update.
             */
            setSettings(settings) {
                set({ settings: { ...get().settings, ...settings } });
            },

            /**
             * Restore the default application settings.
             */
            clear() {
                set({ settings: defaultSettings });
            }
        }),
        { name: "settings" }
    )
);
