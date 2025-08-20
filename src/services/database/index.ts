import type { DatabaseAdapter } from '../../types';
import { detectPlatform } from '../platform';
import { DesktopDatabaseAdapter } from '../../adapters/desktop';
import { WebDatabaseAdapter } from '../../adapters/web';

/**
 * Database service factory that returns the appropriate adapter based on platform
 */
class DatabaseService {
  private adapter: DatabaseAdapter | null = null;

  async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.adapter) {
      const platform = detectPlatform();
      
      if (platform === 'desktop') {
        this.adapter = new DesktopDatabaseAdapter();
      } else {
        this.adapter = new WebDatabaseAdapter();
      }
      
      await this.adapter.initialize();
    }
    
    return this.adapter;
  }

  async closeConnection(): Promise<void> {
    if (this.adapter) {
      await this.adapter.close();
      this.adapter = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
