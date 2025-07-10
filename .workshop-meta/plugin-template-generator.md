# 🏭 Plugin Template Generator

## 📋 Template Types

### 1. UI Enhancement Plugin
```typescript
// main.ts
import { Plugin } from 'obsidian';
import { UIPluginSettings, DEFAULT_SETTINGS } from './settings';
import { UIPluginSettingTab } from './settings-tab';
import { UIPluginView } from './view';

export default class UIEnhancementPlugin extends Plugin {
  settings: UIPluginSettings;

  async onload() {
    await this.loadSettings();
    
    this.addSettingTab(new UIPluginSettingTab(this.app, this));
    
    this.registerView(
      'view-type-id',
      (leaf) => new UIPluginView(leaf, this)
    );
    
    this.addRibbonIcon('dice', 'Plugin Name', () => {
      this.activateView();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;
    
    let leaf = workspace.getLeavesOfType('view-type-id')[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: 'view-type-id' });
    }
    workspace.revealLeaf(leaf);
  }
}
```

```typescript
// settings.ts
export interface UIPluginSettings {
  setting1: string;
  setting2: number;
  setting3: boolean;
}

export const DEFAULT_SETTINGS: UIPluginSettings = {
  setting1: 'default',
  setting2: 0,
  setting3: false
};
```

```typescript
// settings-tab.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import UIEnhancementPlugin from './main';

export class UIPluginSettingTab extends PluginSettingTab {
  plugin: UIEnhancementPlugin;

  constructor(app: App, plugin: UIEnhancementPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    new Setting(containerEl)
      .setName('Setting 1')
      .setDesc('Description')
      .addText(text => text
        .setPlaceholder('Default')
        .setValue(this.plugin.settings.setting1)
        .onChange(async (value) => {
          this.plugin.settings.setting1 = value;
          await this.plugin.saveSettings();
        }));
  }
}
```

```typescript
// view.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';
import UIEnhancementPlugin from './main';

export class UIPluginView extends ItemView {
  plugin: UIEnhancementPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: UIEnhancementPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return 'view-type-id';
  }

  getDisplayText(): string {
    return 'View Display Name';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: 'View Content' });
  }

  async onClose() {
    // Cleanup
  }
}
```

### 2. Data Processing Plugin
```typescript
// main.ts
import { Plugin } from 'obsidian';
import { DataProcessor } from './processor';
import { DataPluginSettings, DEFAULT_SETTINGS } from './settings';

export default class DataProcessingPlugin extends Plugin {
  settings: DataPluginSettings;
  processor: DataProcessor;

  async onload() {
    await this.loadSettings();
    
    this.processor = new DataProcessor(this);
    
    this.addCommand({
      id: 'process-data',
      name: 'Process Data',
      callback: () => this.processor.processCurrentFile()
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

```typescript
// processor.ts
import { TFile } from 'obsidian';
import DataProcessingPlugin from './main';

export class DataProcessor {
  plugin: DataProcessingPlugin;

  constructor(plugin: DataProcessingPlugin) {
    this.plugin = plugin;
  }

  async processCurrentFile() {
    const file = this.plugin.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) {
      return;
    }

    try {
      const content = await this.plugin.app.vault.read(file);
      const processed = await this.processContent(content);
      await this.plugin.app.vault.modify(file, processed);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }

  async processContent(content: string): Promise<string> {
    // Implement processing logic
    return content;
  }
}
```

### 3. Integration Plugin
```typescript
// main.ts
import { Plugin } from 'obsidian';
import { ApiClient } from './api-client';
import { IntegrationSettings, DEFAULT_SETTINGS } from './settings';

export default class IntegrationPlugin extends Plugin {
  settings: IntegrationSettings;
  api: ApiClient;

  async onload() {
    await this.loadSettings();
    
    this.api = new ApiClient(this.settings.apiKey);
    
    this.addCommand({
      id: 'sync-data',
      name: 'Sync Data',
      callback: () => this.syncData()
    });
  }

  async syncData() {
    try {
      await this.api.sync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

```typescript
// api-client.ts
export class ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sync(): Promise<void> {
    try {
      // Implement sync logic
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async request(endpoint: string, data: any): Promise<any> {
    // Implement request logic
  }
}
```

### 4. Workflow Plugin
```typescript
// main.ts
import { Plugin } from 'obsidian';
import { WorkflowManager } from './workflow';
import { WorkflowSettings, DEFAULT_SETTINGS } from './settings';

export default class WorkflowPlugin extends Plugin {
  settings: WorkflowSettings;
  workflow: WorkflowManager;

  async onload() {
    await this.loadSettings();
    
    this.workflow = new WorkflowManager(this);
    
    this.addCommand({
      id: 'start-workflow',
      name: 'Start Workflow',
      callback: () => this.workflow.start()
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

```typescript
// workflow.ts
import WorkflowPlugin from './main';

export class WorkflowManager {
  plugin: WorkflowPlugin;
  currentStep: string;

  constructor(plugin: WorkflowPlugin) {
    this.plugin = plugin;
    this.currentStep = '';
  }

  async start() {
    try {
      await this.step1();
      await this.step2();
      await this.step3();
    } catch (error) {
      console.error('Workflow failed:', error);
    }
  }

  private async step1() {
    this.currentStep = 'step1';
    // Implement step 1
  }

  private async step2() {
    this.currentStep = 'step2';
    // Implement step 2
  }

  private async step3() {
    this.currentStep = 'step3';
    // Implement step 3
  }
}
```

## 📦 Project Structure

### Common Structure
```
plugin-name/
├── .github/
│   └── workflows/
│       └── release.yml
├── src/
│   ├── main.ts
│   ├── settings.ts
│   ├── types.ts
│   └── components/
├── styles.css
├── manifest.json
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

### Required Files

#### manifest.json
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "Plugin description",
  "author": "Your Name",
  "authorUrl": "https://your-website.com",
  "isDesktopOnly": false
}
```

#### package.json
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^16.11.6",
    "@typescript-eslint/eslint-plugin": "^5.2.0",
    "@typescript-eslint/parser": "^5.2.0",
    "builtin-modules": "^3.2.0",
    "esbuild": "0.13.12",
    "obsidian": "latest",
    "tslib": "2.3.1",
    "typescript": "4.4.4"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": [
      "DOM",
      "ES5",
      "ES6",
      "ES7"
    ]
  },
  "include": [
    "**/*.ts"
  ]
}
```

## 🚀 Usage

1. Choose plugin type
2. Copy relevant template
3. Update metadata files
4. Implement core logic
5. Test functionality
6. Build and release

## 📝 Template Customization

### 1. Settings
```typescript
// Add custom settings
export interface CustomSettings extends BaseSettings {
  newSetting: string;
}
```

### 2. Commands
```typescript
// Add custom command
this.addCommand({
  id: 'custom-command',
  name: 'Custom Command',
  callback: () => this.customFunction()
});
```

### 3. Views
```typescript
// Add custom view
this.registerView(
  'custom-view',
  (leaf) => new CustomView(leaf, this)
);
```

### 4. Events
```typescript
// Register custom event
this.registerEvent(
  this.app.workspace.on('file-open', () => {
    // Handle event
  })
);
```

## 🔍 Testing

### Unit Tests
```typescript
describe('Plugin', () => {
  let plugin: YourPlugin;
  
  beforeEach(() => {
    plugin = new YourPlugin();
  });
  
  test('should initialize', () => {
    expect(plugin).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Integration', () => {
  test('should work with app', async () => {
    // Test app integration
  });
});
```

## 📦 Building

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
```

## 📝 Documentation

### README Template
```markdown
# Plugin Name

## Features
- Feature 1
- Feature 2

## Installation
1. Step 1
2. Step 2

## Usage
1. Usage step 1
2. Usage step 2

## Configuration
- Setting 1
- Setting 2
```

Remember:
- Update metadata
- Implement error handling
- Add documentation
- Test thoroughly
- Follow security practices

Last Updated: 2025-07-09 