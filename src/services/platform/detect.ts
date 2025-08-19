export const isTauri = () => !!(window as any).__TAURI_INTERNALS__;
export const isWeb = () => !isTauri();

export type Platform = "desktop" | "web";
export const getPlatform = (): Platform => (isTauri() ? "desktop" : "web");
