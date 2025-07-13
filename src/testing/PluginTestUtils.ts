/**
 * Plugin Testing Utilities
 * 
 * Provides utilities for testing Obsidian plugins in a mock environment
 */

import { App, Plugin, TFile, Vault, Workspace } from 'obsidian';

export interface MockAppConfig {
  vaultName?: string;
  files?: MockFile[];
  settings?: Record<string, any>;
}

export interface MockFile {
  path: string;
  content: string;
  stat?: {
    ctime: number;
    mtime: number;
    size: number;
  };
}

/**
 * Mock App implementation for testing
 */
export class MockApp {
  public vault: MockVault;
  public workspace: MockWorkspace;
  public setting: any;
  public plugins: any;

  constructor(config: MockAppConfig = {}) {
    this.vault = new MockVault(config.files || []);
    this.workspace = new MockWorkspace();
    this.setting = config.settings || {};
    this.plugins = new MockPlugins();
  }

  // Add any additional App methods needed for testing
}

/**
 * Mock Vault implementation
 */
export class MockVault {
  private files: Map<string, MockFile>;

  constructor(files: MockFile[] = []) {
    this.files = new Map();
    files.forEach(file => this.files.set(file.path, file));
  }

  async read(file: TFile): Promise<string> {
    const mockFile = this.files.get(file.path);
    if (!mockFile) {
      throw new Error(`File not found: ${file.path}`);
    }
    return mockFile.content;
  }

  async write(file: TFile, content: string): Promise<void> {
    const mockFile = this.files.get(file.path);
    if (mockFile) {
      mockFile.content = content;
      if (mockFile.stat) {
        mockFile.stat.mtime = Date.now();
      }
    }
  }

  async create(path: string, content: string): Promise<TFile> {
    const mockFile: MockFile = {
      path,
      content,
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: content.length
      }
    };
    this.files.set(path, mockFile);
    
    // Return a mock TFile
    return {
      path,
      name: path.split('/').pop() || '',
      basename: path.split('/').pop()?.split('.')[0] || '',
      extension: path.split('.').pop() || '',
      stat: mockFile.stat,
      vault: this as any
    } as TFile;
  }

  async delete(file: TFile): Promise<void> {
    this.files.delete(file.path);
  }

  getFiles(): TFile[] {
    return Array.from(this.files.entries()).map(([path, file]) => ({
      path,
      name: path.split('/').pop() || '',
      basename: path.split('/').pop()?.split('.')[0] || '',
      extension: path.split('.').pop() || '',
      stat: file.stat || { ctime: 0, mtime: 0, size: 0 },
      vault: this as any
    } as TFile));
  }

  getAbstractFileByPath(path: string): TFile | null {
    const file = this.files.get(path);
    if (!file) return null;
    
    return {
      path,
      name: path.split('/').pop() || '',
      basename: path.split('/').pop()?.split('.')[0] || '',
      extension: path.split('.').pop() || '',
      stat: file.stat || { ctime: 0, mtime: 0, size: 0 },
      vault: this as any
    } as TFile;
  }
}

/**
 * Mock Workspace implementation
 */
export class MockWorkspace {
  private activeFile: TFile | null = null;

  getActiveFile(): TFile | null {
    return this.activeFile;
  }

  setActiveFile(file: TFile | null): void {
    this.activeFile = file;
  }

  // Add more workspace methods as needed
}

/**
 * Mock Plugins implementation
 */
export class MockPlugins {
  private enabledPlugins: Map<string, Plugin> = new Map();

  getPlugin(id: string): Plugin | null {
    return this.enabledPlugins.get(id) || null;
  }

  enablePlugin(id: string, plugin: Plugin): void {
    this.enabledPlugins.set(id, plugin);
  }

  disablePlugin(id: string): void {
    this.enabledPlugins.delete(id);
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins.values());
  }
}

/**
 * Plugin Test Runner
 */
export class PluginTestRunner {
  private mockApp: MockApp;
  private plugin: Plugin | null = null;

  constructor(config: MockAppConfig = {}) {
    this.mockApp = new MockApp(config);
  }

  async loadPlugin(PluginClass: new (app: App, manifest: any) => Plugin, manifest: any): Promise<Plugin> {
    const plugin = new PluginClass(this.mockApp as any, manifest);
    this.plugin = plugin;
    return plugin;
  }

  async enablePlugin(): Promise<void> {
    if (!this.plugin) {
      throw new Error('No plugin loaded. Call loadPlugin() first.');
    }
    
    // Simulate plugin loading
    await this.plugin.onload();
  }

  async disablePlugin(): Promise<void> {
    if (!this.plugin) {
      throw new Error('No plugin loaded. Call loadPlugin() first.');
    }
    
    // Simulate plugin unloading
    this.plugin.onunload();
  }

  getApp(): MockApp {
    return this.mockApp;
  }

  getPlugin(): Plugin | null {
    return this.plugin;
  }

  // Test utilities
  async triggerCommand(commandId: string): Promise<void> {
    if (!this.plugin) {
      throw new Error('No plugin loaded');
    }

    // This would need to be implemented based on how commands are stored
    // For now, this is a placeholder
    console.log(`Triggering command: ${commandId}`);
  }

  async createTestFile(path: string, content: string): Promise<TFile> {
    return await this.mockApp.vault.create(path, content);
  }

  async setActiveFile(path: string): Promise<void> {
    const file = this.mockApp.vault.getAbstractFileByPath(path);
    this.mockApp.workspace.setActiveFile(file);
  }
}

/**
 * Helper functions for common testing scenarios
 */
export class PluginTestHelpers {
  /**
   * Create a basic test environment with some sample files
   */
  static createBasicTestEnvironment(): PluginTestRunner {
    const testFiles: MockFile[] = [
      {
        path: 'README.md',
        content: '# Test Vault\n\nThis is a test vault for plugin testing.'
      },
      {
        path: 'Notes/Test Note.md',
        content: '# Test Note\n\nThis is a test note with some [[Link]] content.'
      },
      {
        path: 'Daily/2024-01-01.md',
        content: '# Daily Note\n\n- Task 1\n- Task 2'
      }
    ];

    return new PluginTestRunner({
      vaultName: 'Test Vault',
      files: testFiles
    });
  }

  /**
   * Create a test environment with custom files
   */
  static createCustomTestEnvironment(files: MockFile[]): PluginTestRunner {
    return new PluginTestRunner({
      vaultName: 'Custom Test Vault',
      files
    });
  }

  /**
   * Simulate user interaction delays
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert that a condition is true
   */
  static assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert that two values are equal
   */
  static assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message || `Expected ${expected}, got ${actual}`}`);
    }
  }
}

/**
 * Example usage in tests:
 * 
 * ```typescript
 * import { PluginTestRunner, PluginTestHelpers } from './PluginTestUtils';
 * import MyPlugin from '../plugins/my-plugin/main';
 * 
 * describe('MyPlugin', () => {
 *   let testRunner: PluginTestRunner;
 *   
 *   beforeEach(() => {
 *     testRunner = PluginTestHelpers.createBasicTestEnvironment();
 *   });
 *   
 *   it('should load successfully', async () => {
 *     const manifest = { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' };
 *     const plugin = await testRunner.loadPlugin(MyPlugin, manifest);
 *     await testRunner.enablePlugin();
 *     
 *     PluginTestHelpers.assert(plugin !== null, 'Plugin should be loaded');
 *   });
 *   
 *   it('should create a test file', async () => {
 *     const file = await testRunner.createTestFile('test.md', '# Test');
 *     PluginTestHelpers.assertEqual(file.name, 'test.md');
 *   });
 * });
 * ```
 */