import type { Mock } from 'jest';
import { App, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';
import SamplePlugin from '../src/main';

// Mock Obsidian APIs
jest.mock('obsidian', () => ({
  App: jest.fn(),
  Plugin: jest.fn().mockImplementation(() => ({
    loadData: jest.fn().mockResolvedValue({}),
    saveData: jest.fn().mockResolvedValue(undefined),
    registerEvent: jest.fn(),
    addCommand: jest.fn(),
    addRibbonIcon: jest.fn().mockReturnValue({
      addClass: jest.fn()
    }),
    addSettingTab: jest.fn()
  })),
  PluginSettingTab: jest.fn(),
  Setting: jest.fn(),
  Notice: jest.fn(),
  TFile: jest.fn()
}));

describe('SamplePlugin', () => {
  let app: jest.Mocked<App>;
  let plugin: SamplePlugin;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock app instance
    app = new App() as jest.Mocked<App>;
    
    // Create plugin instance
    plugin = new SamplePlugin(app, {
      id: 'sample-plugin',
      name: 'Sample Plugin',
      version: '1.0.0',
      minAppVersion: '1.0.0'
    });
  });

  describe('Plugin Lifecycle', () => {
    test('loads settings on initialization', async () => {
      await plugin.onload();
      expect(plugin.loadData).toHaveBeenCalled();
    });

    test('registers commands on load', async () => {
      await plugin.onload();
      expect(plugin.addCommand).toHaveBeenCalledTimes(2);
    });

    test('adds ribbon icon on load', async () => {
      await plugin.onload();
      expect(plugin.addRibbonIcon).toHaveBeenCalled();
    });

    test('adds settings tab on load', async () => {
      await plugin.onload();
      expect(plugin.addSettingTab).toHaveBeenCalled();
    });

    test('cleans up on unload', () => {
      plugin.onunload();
      // Add specific cleanup checks based on your plugin's cleanup needs
    });
  });

  describe('Settings Management', () => {
    test('loads default settings when no saved data', async () => {
      (plugin.loadData as Mock).mockResolvedValueOnce(null);
      await plugin.loadSettings();
      expect(plugin.settings).toEqual({
        customMessage: 'Hello, Obsidian!',
        enableFeature: true,
        refreshInterval: 5000
      });
    });

    test('merges saved settings with defaults', async () => {
      const savedSettings = {
        customMessage: 'Custom Message',
        enableFeature: false
      };
      (plugin.loadData as Mock).mockResolvedValueOnce(savedSettings);
      await plugin.loadSettings();
      expect(plugin.settings).toEqual({
        ...savedSettings,
        refreshInterval: 5000 // Default value for missing setting
      });
    });

    test('saves settings successfully', async () => {
      await plugin.saveSettings();
      expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
    });
  });

  describe('Command Handling', () => {
    test('executes sample command', () => {
      plugin.settings = {
        customMessage: 'Test Message',
        enableFeature: true,
        refreshInterval: 5000
      };
      plugin['executeSampleCommand']();
      expect(Notice).toHaveBeenCalledWith('Test Message');
    });

    test('handles conditional command with active file', () => {
      const mockFile = new TFile();
      (app.workspace as any) = {
        getActiveFile: jest.fn().mockReturnValue(mockFile)
      };

      const checkCallback = (plugin['addCommand'] as Mock).mock.calls.find(
        call => call[0].id === 'conditional-command'
      )?.[0].checkCallback;

      expect(checkCallback?.(false)).toBe(true);
    });

    test('handles conditional command without active file', () => {
      (app.workspace as any) = {
        getActiveFile: jest.fn().mockReturnValue(null)
      };

      const checkCallback = (plugin['addCommand'] as Mock).mock.calls.find(
        call => call[0].id === 'conditional-command'
      )?.[0].checkCallback;

      expect(checkCallback?.(false)).toBe(false);
    });
  });

  describe('Feature Management', () => {
    test('starts refresh interval when feature enabled', () => {
      jest.spyOn(window, 'setInterval');
      plugin.settings.enableFeature = true;
      plugin['initializeFeatures']();
      expect(window.setInterval).toHaveBeenCalled();
    });

    test('does not start refresh interval when feature disabled', () => {
      jest.spyOn(window, 'setInterval');
      plugin.settings.enableFeature = false;
      plugin['initializeFeatures']();
      expect(window.setInterval).not.toHaveBeenCalled();
    });

    test('cleans up refresh interval on feature disable', () => {
      jest.spyOn(window, 'clearInterval');
      plugin['refreshIntervalId'] = 123;
      plugin['cleanupFeatures']();
      expect(window.clearInterval).toHaveBeenCalledWith(123);
    });
  });

  describe('Error Handling', () => {
    test('handles load failure gracefully', async () => {
      const error = new Error('Load failed');
      (plugin.loadData as Mock).mockRejectedValueOnce(error);
      
      await plugin.onload();
      
      expect(console.error).toHaveBeenCalledWith('Failed to load plugin:', error);
      expect(Notice).toHaveBeenCalledWith('Failed to initialize plugin. Check console for details.');
    });

    test('handles save failure gracefully', async () => {
      const error = new Error('Save failed');
      (plugin.saveData as Mock).mockRejectedValueOnce(error);
      
      await expect(plugin.saveSettings()).rejects.toThrow('Save failed');
    });
  });
}); 