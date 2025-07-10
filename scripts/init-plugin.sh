#!/bin/bash

# Obsidian Plugin Initialization Script
# Usage: ./init-plugin.sh <plugin-name>

PLUGIN_NAME=$1
TEMPLATE_DIR="plugins/sample-plugin"
TARGET_DIR="plugins/$PLUGIN_NAME"

# Input validation
if [ -z "$PLUGIN_NAME" ]; then
  echo "Error: Plugin name required"
  echo "Usage: ./init-plugin.sh <plugin-name>"
  exit 1
fi

if [ -d "$TARGET_DIR" ]; then
  echo "Error: Plugin directory already exists: $TARGET_DIR"
  exit 1
fi

# Create plugin directory structure
echo "Creating plugin structure for: $PLUGIN_NAME"
mkdir -p "$TARGET_DIR/src"
mkdir -p "$TARGET_DIR/__tests__"

# Copy template files
cp "$TEMPLATE_DIR/manifest.json" "$TARGET_DIR/"
cp "$TEMPLATE_DIR/plugin.md" "$TARGET_DIR/"
cp "$TEMPLATE_DIR/TODO.md" "$TARGET_DIR/"
cp "$TEMPLATE_DIR/reflections.md" "$TARGET_DIR/"

# Create symlink in vault sandbox
SANDBOX_DIR="vault-sandbox/.obsidian/plugins"
mkdir -p "$SANDBOX_DIR"
ln -s "../../$TARGET_DIR" "$SANDBOX_DIR/$PLUGIN_NAME"

# Initialize package.json
cat > "$TARGET_DIR/package.json" << EOF
{
  "name": "obsidian-$PLUGIN_NAME",
  "version": "1.0.0",
  "description": "An Obsidian plugin",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "test": "jest"
  },
  "keywords": ["obsidian-plugin"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^16.11.6",
    "@types/jest": "^27.0.3",
    "obsidian": "^1.1.1",
    "typescript": "4.4.4",
    "jest": "^27.3.1",
    "ts-jest": "^27.0.7"
  }
}
EOF

# Initialize TypeScript config
cat > "$TARGET_DIR/tsconfig.json" << EOF
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
EOF

# Create main plugin file
cat > "$TARGET_DIR/src/main.ts" << EOF
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
  setting1: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  setting1: 'default'
}

export default class MyPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'sample-command',
      name: 'Sample Command',
      callback: () => {
        console.log('Sample command executed');
      }
    });
  }

  onunload() {
    console.log('Unloading plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
EOF

echo "Plugin initialized successfully at: $TARGET_DIR"
echo "Next steps:"
echo "1. cd $TARGET_DIR"
echo "2. npm install"
echo "3. npm run dev" 