#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PluginConfig {
  id: string;
  name: string;
  description: string;
  author: string;
  authorUrl?: string;
  version: string;
  minAppVersion: string;
}

class PluginGenerator {
  private templatePath: string;
  private pluginsPath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '..', 'templates', 'basic-plugin');
    this.pluginsPath = path.join(__dirname, '..', 'plugins');
  }

  async generatePlugin(config: PluginConfig): Promise<void> {
    const pluginPath = path.join(this.pluginsPath, config.id);

    // Check if plugin already exists
    if (fs.existsSync(pluginPath)) {
      throw new Error(`Plugin '${config.id}' already exists!`);
    }

    console.log(`Creating plugin: ${config.name}`);
    console.log(`Location: ${pluginPath}`);

    // Create plugin directory
    fs.mkdirSync(pluginPath, { recursive: true });

    // Copy template files
    this.copyTemplateFiles(pluginPath);

    // Update manifest.json
    this.updateManifest(pluginPath, config);

    // Update main.ts
    this.updateMainFile(pluginPath, config);

    // Create package.json
    this.createPackageJson(pluginPath, config);

    // Create .gitignore
    this.createGitignore(pluginPath);

    console.log(`✅ Plugin '${config.name}' created successfully!`);
    console.log(`Next steps:`);
    console.log(`  cd plugins/${config.id}`);
    console.log(`  npm install`);
    console.log(`  npm run build`);
  }

  private copyTemplateFiles(pluginPath: string): void {
    const filesToCopy = ['main.ts', 'tsconfig.json', 'README.md'];
    
    filesToCopy.forEach(fileName => {
      const sourcePath = path.join(this.templatePath, fileName);
      const destPath = path.join(pluginPath, fileName);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`📄 Copied ${fileName}`);
      }
    });
  }

  private updateManifest(pluginPath: string, config: PluginConfig): void {
    const manifestPath = path.join(pluginPath, 'manifest.json');
    const manifest = {
      id: config.id,
      name: config.name,
      version: config.version,
      minAppVersion: config.minAppVersion,
      description: config.description,
      author: config.author,
      authorUrl: config.authorUrl || '',
      isDesktopOnly: false
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Created manifest.json`);
  }

  private updateMainFile(pluginPath: string, config: PluginConfig): void {
    const mainPath = path.join(pluginPath, 'main.ts');
    let content = fs.readFileSync(mainPath, 'utf8');

    // Convert plugin name to PascalCase for class name
    const className = this.toPascalCase(config.name);
    const settingsInterface = `${className}Settings`;

    // Replace class and interface names
    content = content.replace(/MyPlugin/g, className);
    content = content.replace(/MyPluginSettings/g, settingsInterface);

    // Replace plugin name in comments and strings
    content = content.replace(/Sample Plugin/g, config.name);
    content = content.replace(/sample-plugin/g, config.id);

    fs.writeFileSync(mainPath, content);
    console.log(`📄 Updated main.ts with plugin name`);
  }

  private createPackageJson(pluginPath: string, config: PluginConfig): void {
    const packageJson = {
      name: config.id,
      version: config.version,
      description: config.description,
      main: 'main.js',
      scripts: {
        build: 'tsc -p tsconfig.json',
        dev: 'tsc -p tsconfig.json --watch'
      },
      keywords: ['obsidian', 'plugin'],
      author: config.author,
      license: 'MIT',
      devDependencies: {
        '@types/node': '^20.0.0',
        'obsidian': 'latest',
        'typescript': '^5.0.0'
      }
    };

    const packagePath = path.join(pluginPath, 'package.json');
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`📄 Created package.json`);
  }

  private createGitignore(pluginPath: string): void {
    const gitignoreContent = `# Compiled output
main.js
main.js.map
*.js.map

# Dependencies
node_modules/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;

    const gitignorePath = path.join(pluginPath, '.gitignore');
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log(`📄 Created .gitignore`);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toUpperCase())
      .replace(/\s+/g, '');
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run create-plugin <plugin-id>');
    console.log('Example: npm run create-plugin my-awesome-plugin');
    process.exit(1);
  }

  const pluginId = args[0];
  
  // Interactive prompts would go here in a real implementation
  // For now, we'll use sensible defaults
  const config: PluginConfig = {
    id: pluginId,
    name: pluginId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `A plugin for Obsidian`,
    author: 'Your Name',
    version: '1.0.0',
    minAppVersion: '0.15.0'
  };

  const generator = new PluginGenerator();
  
  try {
    await generator.generatePlugin(config);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}