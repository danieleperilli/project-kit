export const errorCodes = ["404", "500", "503"] as const;
export type ErrorCode = (typeof errorCodes)[number];

declare global {
    interface History {
        status?: ErrorCode;
    }

    interface Window {
        APP_ERROR?: ErrorCode;
        __STATIC_STATUS__?: ErrorCode;
    }
}

export {};
