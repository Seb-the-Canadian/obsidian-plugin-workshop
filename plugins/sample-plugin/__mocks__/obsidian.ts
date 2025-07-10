/// <reference types="jest" />

export class App {
  workspace = {
    getActiveFile: jest.fn(),
    on: jest.fn(),
    triggeredContextMenu: jest.fn().mockReturnValue({
      addItem: jest.fn()
    })
  };
}

export class Plugin {
  app: App;
  manifest: any;

  constructor(app: App, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
  registerEvent = jest.fn();
  addCommand = jest.fn();
  addRibbonIcon = jest.fn().mockReturnValue({
    addClass: jest.fn()
  });
  addSettingTab = jest.fn();
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }

  display(): void {
    // Mock implementation
  }

  hide(): void {
    // Mock implementation
  }
}

export class Setting {
  constructor(containerEl: HTMLElement) {}

  setName(name: string): this {
    return this;
  }

  setDesc(desc: string): this {
    return this;
  }

  addText(cb: (text: TextComponent) => any): this {
    return this;
  }

  addToggle(cb: (toggle: ToggleComponent) => any): this {
    return this;
  }

  addSlider(cb: (slider: SliderComponent) => any): this {
    return this;
  }
}

export class Notice {
  constructor(message: string) {}
}

export class TFile {
  path: string;
  
  constructor(path: string = '') {
    this.path = path;
  }
}

export interface TextComponent {
  setValue(value: string): this;
  getValue(): string;
  onChange(callback: (value: string) => any): this;
  setPlaceholder(placeholder: string): this;
}

export interface ToggleComponent {
  setValue(value: boolean): this;
  getValue(): boolean;
  onChange(callback: (value: boolean) => any): this;
}

export interface SliderComponent {
  setValue(value: number): this;
  getValue(): number;
  onChange(callback: (value: number) => any): this;
  setLimits(min: number, max: number, step: number): this;
  setDynamicTooltip(): this;
} 