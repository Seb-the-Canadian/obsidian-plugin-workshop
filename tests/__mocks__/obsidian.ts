/**
 * Mock implementation of Obsidian API for testing
 */

export class Plugin {
  app: any;
  manifest: any;
  
  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }
}

export class Notice {
  constructor(message: string) {
    console.log(`Notice: ${message}`);
  }
}

export class Setting {
  constructor() {}
}

export class PluginSettingTab {
  constructor() {}
}

export class Component {
  constructor() {}
}

export class TFile {
  constructor() {}
}

export class Vault {
  constructor() {}
}