import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Menu, WorkspaceLeaf } from 'obsidian';

/**
 * Interface defining plugin settings structure
 */
interface SamplePluginSettings {
  customMessage: string;
  enableFeature: boolean;
  refreshInterval: number;
}

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: SamplePluginSettings = {
  customMessage: 'Hello, Obsidian!',
  enableFeature: true,
  refreshInterval: 5000
};

/**
 * Sample Plugin demonstrating Obsidian plugin development best practices
 */
export default class SamplePlugin extends Plugin {
  settings: SamplePluginSettings;
  private refreshIntervalId?: number;

  async onload(): Promise<void> {
    try {
      await this.loadSettings();
      this.addSettingTab(new SampleSettingTab(this.app, this));
      this.registerCommands();
      this.initializeFeatures();
    } catch (error) {
      console.error('Failed to load plugin:', error);
      new Notice('Failed to initialize plugin. Check console for details.');
    }
  }

  onunload(): void {
    this.cleanupFeatures();
  }

  /**
   * Registers plugin commands
   */
  private registerCommands(): void {
    // Example command registration
    this.addCommand({
      id: 'sample-command',
      name: 'Execute Sample Command',
      callback: () => this.executeSampleCommand()
    });

    // Command with check function
    this.addCommand({
      id: 'conditional-command',
      name: 'Execute Conditional Command',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          if (!checking) {
            this.handleActiveFile(activeFile);
          }
          return true;
        }
        return false;
      }
    });
  }

  /**
   * Initializes plugin features
   */
  private initializeFeatures(): void {
    if (this.settings.enableFeature) {
      this.startRefreshInterval();
    }

    // Register event handlers
    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (file) this.handleFileOpen(file);
      })
    );

    // Add ribbon icon
    const ribbonIconEl = this.addRibbonIcon(
      'dice',
      'Sample Plugin',
      (evt: MouseEvent) => {
        const menu = this.app.workspace.triggeredContextMenu(evt);
        menu.addItem((item) => {
          item
            .setTitle('Action 1')
            .setIcon('document')
            .onClick(() => this.handleAction1());
        });
      }
    );
    ribbonIconEl.addClass('sample-plugin-ribbon-class');
  }

  /**
   * Cleans up plugin features
   */
  private cleanupFeatures(): void {
    if (this.refreshIntervalId) {
      window.clearInterval(this.refreshIntervalId);
    }
  }

  /**
   * Loads plugin settings
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * Saves plugin settings
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * Starts the refresh interval if enabled
   */
  private startRefreshInterval(): void {
    this.refreshIntervalId = window.setInterval(() => {
      this.refreshContent();
    }, this.settings.refreshInterval);

    // Register for cleanup
    this.registerInterval(this.refreshIntervalId);
  }

  /**
   * Handles the sample command execution
   */
  private executeSampleCommand(): void {
    new Notice(this.settings.customMessage);
  }

  /**
   * Handles active file processing
   */
  private handleActiveFile(file: TFile): void {
    new Notice(`Processing file: ${file.path}`);
  }

  /**
   * Handles file open events
   */
  private handleFileOpen(file: TFile): void {
    console.log('File opened:', file.path);
  }

  /**
   * Handles action 1 from the ribbon icon menu
   */
  private handleAction1(): void {
    new Notice('Action 1 executed');
  }

  /**
   * Refreshes content periodically
   */
  private refreshContent(): void {
    console.log('Refreshing content...');
  }
}

/**
 * Settings tab for the sample plugin
 */
class SampleSettingTab extends PluginSettingTab {
  plugin: SamplePlugin;

  constructor(app: App, plugin: SamplePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Custom Message')
      .setDesc('Enter a custom message for the sample command')
      .addText(text => text
        .setPlaceholder('Enter message')
        .setValue(this.plugin.settings.customMessage)
        .onChange(async (value) => {
          this.plugin.settings.customMessage = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable Feature')
      .setDesc('Enable or disable the sample feature')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableFeature)
        .onChange(async (value) => {
          this.plugin.settings.enableFeature = value;
          await this.plugin.saveSettings();
          
          if (value) {
            this.plugin.startRefreshInterval();
          } else {
            this.plugin.cleanupFeatures();
          }
        }));

    new Setting(containerEl)
      .setName('Refresh Interval')
      .setDesc('Set the refresh interval in milliseconds')
      .addSlider(slider => slider
        .setLimits(1000, 10000, 1000)
        .setValue(this.plugin.settings.refreshInterval)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.refreshInterval = value;
          await this.plugin.saveSettings();
        }));
  }
} 