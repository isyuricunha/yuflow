import type { Platform } from '../../types';

/**
 * Detects the current platform (desktop via Tauri or web)
 */
export function detectPlatform(): Platform {
  // Check if we're running in Tauri (desktop)
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return 'desktop';
  }
  
  return 'web';
}

/**
 * Checks if the app is running in desktop mode (Tauri)
 */
export function isDesktop(): boolean {
  return detectPlatform() === 'desktop';
}

/**
 * Checks if the app is running in web mode
 */
export function isWeb(): boolean {
  return detectPlatform() === 'web';
}

/**
 * Gets platform-specific configuration
 */
export function getPlatformConfig() {
  const platform = detectPlatform();
  
  return {
    platform,
    supportsFileSystem: platform === 'desktop',
    supportsNotifications: true,
    supportsBackup: platform === 'desktop',
    databaseType: platform === 'desktop' ? 'sqlite' : 'indexeddb',
  };
}
