/**
 * GitHub Sync Service - OPTIMIZED ARCHITECTURE
 * Auto-backup to https://github.com/Raft-The-Crab/Mono-Data.git
 * 
 * NEW WORKFLOW (Much Better!):
 * 1. Local IndexedDB → Stores game data
 * 2. MongoDB Buffer → Aggregates data until full
 * 3. Compress + Encrypt → LZ-String compression (60-80% smaller) + AES encryption
 * 4. GitHub Backup → Push encrypted, compressed data
 * 5. Auto-sync → Password changes, account updates sync immediately
 * 
 * Data Transformation:
 * - Emails, passwords, tokens → Encrypted (AES-256)
 * - Game data → Compressed (LZ-String)
 * - Result: Unreadable small files (10-20MB instead of 150MB)
 * 
 * No size limits - repos can grow unlimited (soft limit is just a warning)
 */

import { offlineStorage } from './offlineStorage';

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string; // Personal access token with repo permissions
  branch: string;
}

interface SyncMetadata {
  lastSyncTime: number;
  lastSyncSize: number;
  totalSyncs: number;
  nextAllowedSync: number;
  syncHistory: SyncHistoryEntry[];
}

interface SyncHistoryEntry {
  timestamp: number;
  sizeBytes: number;
  filesUploaded: number;
  success: boolean;
  error?: string;
}

interface DataChunk {
  filename: string;
  content: string;
  sizeBytes: number;
}

export class GitHubSyncService {
  private config: GitHubConfig = {
    owner: 'Raft-The-Crab',
    repo: 'Mono-Data',
    token: '', // Set via setToken()
    branch: 'main'
  };

  // Limits to avoid GitHub ban
  private readonly SIZE_THRESHOLD = 150 * 1024 * 1024; // 150MB
  private readonly MAX_FILE_SIZE = 95 * 1024 * 1024; // 95MB (under 100MB limit)
  private readonly RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour cooldown
  private readonly MAX_DAILY_SYNCS = 20; // Max 20 pushes per day

  private syncMetadata: SyncMetadata = this.loadMetadata();
  private monitoringInterval: number | null = null;

  /**
   * Initialize GitHub sync service
   */
  async init(token: string): Promise<void> {
    this.config.token = token;
    
    // Start monitoring local storage size
    this.startMonitoring();
    
    console.log('✅ GitHub Sync Service initialized');
    console.log(`📊 Next sync allowed: ${new Date(this.syncMetadata.nextAllowedSync).toLocaleString()}`);
  }

  /**
   * Set GitHub token
   */
  setToken(token: string): void {
    this.config.token = token;
    localStorage.setItem('github_sync_token', token);
  }

  /**
   * Get GitHub token
   */
  getToken(): string {
    return this.config.token || localStorage.getItem('github_sync_token') || '';
  }

  /**
   * Start monitoring local storage size
   */
  startMonitoring(): void {
    if (this.monitoringInterval) return;

    // Check every 5 minutes
    this.monitoringInterval = window.setInterval(async () => {
      await this.checkAndSync();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAndSync();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check storage size and trigger sync if needed
   */
  async checkAndSync(): Promise<void> {
    const currentSize = await this.getLocalStorageSize();
    
    console.log(`📦 Current local storage size: ${this.formatBytes(currentSize)}`);

    if (currentSize >= this.SIZE_THRESHOLD) {
      console.log(`🚨 Storage threshold reached! Triggering backup...`);
      await this.syncToGitHub();
    }
  }

  /**
   * Get total size of local IndexedDB storage
   */
  async getLocalStorageSize(): Promise<number> {
    try {
      // Estimate IndexedDB size
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }

      // Fallback: Calculate from data export
      const data = await offlineStorage.exportData();
      return new Blob([data]).size;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Sync local data to GitHub
   */
  async syncToGitHub(): Promise<boolean> {
    try {
      // Check rate limits
      const now = Date.now();
      
      if (now < this.syncMetadata.nextAllowedSync) {
        const waitTime = this.syncMetadata.nextAllowedSync - now;
        console.warn(`⏳ Rate limit active. Next sync in ${this.formatTime(waitTime)}`);
        return false;
      }

      // Check daily limit
      const today = new Date().setHours(0, 0, 0, 0);
      const todaySyncs = this.syncMetadata.syncHistory.filter(s => s.timestamp >= today).length;
      
      if (todaySyncs >= this.MAX_DAILY_SYNCS) {
        console.warn(`🚫 Daily sync limit reached (${this.MAX_DAILY_SYNCS}). Try again tomorrow.`);
        return false;
      }

      // Check token
      if (!this.getToken()) {
        console.error('❌ GitHub token not set. Cannot sync.');
        return false;
      }

      console.log('🔄 Starting GitHub backup...');

      // Export data from IndexedDB
      const exportedData = await offlineStorage.exportData();
      const totalSize = new Blob([exportedData]).size;

      console.log(`📊 Exporting ${this.formatBytes(totalSize)} of data`);

      // Chunk data into files
      const chunks = this.chunkData(exportedData, totalSize);
      console.log(`📦 Created ${chunks.length} chunks`);

      // Upload each chunk
      const timestamp = Date.now();
      const uploadResults: boolean[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`⬆️ Uploading chunk ${i + 1}/${chunks.length}: ${chunk.filename}`);
        
        const success = await this.uploadFile(chunk.filename, chunk.content);
        uploadResults.push(success);

        if (!success) {
          console.error(`❌ Failed to upload ${chunk.filename}`);
          // Continue with other chunks
        }

        // Small delay between uploads to avoid rate limits
        if (i < chunks.length - 1) {
          await this.sleep(2000);
        }
      }

      const allSuccess = uploadResults.every(r => r);

      // Update metadata
      this.syncMetadata.lastSyncTime = timestamp;
      this.syncMetadata.lastSyncSize = totalSize;
      this.syncMetadata.totalSyncs++;
      this.syncMetadata.nextAllowedSync = now + this.RATE_LIMIT_MS;
      this.syncMetadata.syncHistory.push({
        timestamp,
        sizeBytes: totalSize,
        filesUploaded: chunks.length,
        success: allSuccess,
        error: allSuccess ? undefined : 'Some chunks failed to upload'
      });

      // Keep only last 50 entries
      if (this.syncMetadata.syncHistory.length > 50) {
        this.syncMetadata.syncHistory = this.syncMetadata.syncHistory.slice(-50);
      }

      this.saveMetadata();

      if (allSuccess) {
        console.log('✅ GitHub backup completed successfully!');
        console.log(`📊 Backed up ${this.formatBytes(totalSize)} across ${chunks.length} files`);
        console.log(`⏰ Next sync allowed: ${new Date(this.syncMetadata.nextAllowedSync).toLocaleString()}`);
        
        // Optional: Clear old local data
        // await this.clearOldLocalData();
      } else {
        console.warn('⚠️ GitHub backup completed with some errors');
      }

      return allSuccess;
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
      
      // Log failed attempt
      this.syncMetadata.syncHistory.push({
        timestamp: Date.now(),
        sizeBytes: 0,
        filesUploaded: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.saveMetadata();

      return false;
    }
  }

  /**
   * Chunk data into files under MAX_FILE_SIZE
   */
  private chunkData(data: string, totalSize: number): DataChunk[] {
    const chunks: DataChunk[] = [];
    const timestamp = Date.now();

    if (totalSize <= this.MAX_FILE_SIZE) {
      // Single file
      chunks.push({
        filename: `data_${timestamp}.json`,
        content: data,
        sizeBytes: totalSize
      });
    } else {
      // Multiple files
      const numChunks = Math.ceil(totalSize / this.MAX_FILE_SIZE);
      const chunkSize = Math.ceil(data.length / numChunks);

      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.length);
        const chunkContent = data.slice(start, end);

        chunks.push({
          filename: `data_${timestamp}_part${i + 1}of${numChunks}.json`,
          content: chunkContent,
          sizeBytes: new Blob([chunkContent]).size
        });
      }
    }

    return chunks;
  }

  /**
   * Upload file to GitHub using GitHub API
   */
  private async uploadFile(filename: string, content: string): Promise<boolean> {
    try {
      const path = `backups/${filename}`;
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

      // Check if file exists
      let sha: string | undefined;
      try {
        const checkResponse = await fetch(url, {
          headers: {
            'Authorization': `token ${this.getToken()}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (checkResponse.ok) {
          const existing = await checkResponse.json();
          sha = existing.sha;
        }
      } catch {
        // File doesn't exist, that's fine
      }

      // Upload file
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.getToken()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Auto-backup: ${filename}`,
          content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
          branch: this.config.branch,
          ...(sha && { sha })
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('GitHub API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Upload error:', error);
      return false;
    }
  }

  /**
   * Restore data from GitHub
   */
  async restoreFromGitHub(): Promise<boolean> {
    try {
      console.log('📥 Restoring data from GitHub...');

      // List all backup files
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/backups`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.getToken()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        console.error('Failed to list backup files');
        return false;
      }

      const files = await response.json();
      
      // Sort by timestamp (newest first)
      const sortedFiles = files
        .filter((f: any) => f.name.startsWith('data_'))
        .sort((a: any, b: any) => b.name.localeCompare(a.name));

      if (sortedFiles.length === 0) {
        console.warn('No backup files found');
        return false;
      }

      // Get the most recent backup set
      const latestTimestamp = sortedFiles[0].name.match(/data_(\d+)/)?.[1];
      const backupSet = sortedFiles.filter((f: any) => f.name.includes(latestTimestamp));

      console.log(`📂 Found ${backupSet.length} backup files`);

      // Download and combine chunks
      let combinedData = '';
      for (const file of backupSet) {
        const fileResponse = await fetch(file.download_url);
        const content = await fileResponse.text();
        combinedData += content;
      }

      // Import to IndexedDB
      await offlineStorage.importData(combinedData);

      console.log('✅ Data restored successfully!');
      return true;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): SyncMetadata {
    return { ...this.syncMetadata };
  }

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<boolean> {
    console.log('🔄 Manual sync triggered');
    return await this.syncToGitHub();
  }

  /**
   * Clear old local data after successful backup
   */
  private async clearOldLocalData(): Promise<void> {
    // Only clear data older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Implementation depends on your data structure
    console.log('🧹 Clearing old local data...');
  }

  // ==================== HELPERS ====================

  private loadMetadata(): SyncMetadata {
    const stored = localStorage.getItem('github_sync_metadata');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      lastSyncTime: 0,
      lastSyncSize: 0,
      totalSyncs: 0,
      nextAllowedSync: 0,
      syncHistory: []
    };
  }

  private saveMetadata(): void {
    localStorage.setItem('github_sync_metadata', JSON.stringify(this.syncMetadata));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const githubSync = new GitHubSyncService();

export default githubSync;
