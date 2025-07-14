#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

class PluginBuilder {
  private pluginsPath: string;

  constructor() {
    this.pluginsPath = path.join(__dirname, '..', 'plugins');
  }

  async buildPlugin(pluginId: string): Promise<void> {
    const pluginPath = path.join(this.pluginsPath, pluginId);
    
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin '${pluginId}' not found in plugins directory`);
    }

    const manifestPath = path.join(pluginPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`No manifest.json found in plugin '${pluginId}'`);
    }

    const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log(`🔨 Building plugin: ${manifest.name} (${manifest.id})`);
    console.log(`📍 Location: ${pluginPath}`);

    try {
      // Check if package.json exists
      const packageJsonPath = path.join(pluginPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        // Install dependencies if node_modules doesn't exist
        const nodeModulesPath = path.join(pluginPath, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
          console.log('📦 Installing dependencies...');
          execSync('npm install', { cwd: pluginPath, stdio: 'inherit' });
        }
      }

      // Build the plugin
      console.log('🔄 Compiling TypeScript...');
      execSync('npm run build', { cwd: pluginPath, stdio: 'inherit' });

      // Check if main.js was created
      const mainJsPath = path.join(pluginPath, 'main.js');
      if (fs.existsSync(mainJsPath)) {
        console.log('✅ Plugin built successfully!');
        
        // Show build info
        const stats = fs.statSync(mainJsPath);
        console.log(`📊 Build info:`);
        console.log(`   - Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   - Modified: ${stats.mtime.toLocaleString()}`);
      } else {
        throw new Error('Build completed but main.js not found');
      }

    } catch (error) {
      console.error(`❌ Build failed for plugin '${pluginId}':`, error.message);
      throw error;
    }
  }

  async buildAllPlugins(): Promise<void> {
    console.log('🔨 Building all plugins...');
    
    if (!fs.existsSync(this.pluginsPath)) {
      console.log('📁 No plugins directory found');
      return;
    }

    const plugins = fs.readdirSync(this.pluginsPath).filter(item => {
      const itemPath = path.join(this.pluginsPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    if (plugins.length === 0) {
      console.log('📂 No plugins found in plugins directory');
      return;
    }

    console.log(`Found ${plugins.length} plugin(s): ${plugins.join(', ')}`);

    const results: Array<{ plugin: string; success: boolean; error?: string }> = [];
    for (const plugin of plugins) {
      try {
        await this.buildPlugin(plugin);
        results.push({ plugin, success: true });
      } catch (error) {
        results.push({ plugin, success: false, error: error.message });
      }
    }

    // Summary
    console.log('\n📋 Build Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    if (successful.length > 0) {
      successful.forEach(r => console.log(`   - ${r.plugin}`));
    }

    console.log(`❌ Failed: ${failed.length}`);
    if (failed.length > 0) {
      failed.forEach(r => console.log(`   - ${r.plugin}: ${r.error}`));
    }
  }

  async cleanPlugin(pluginId: string): Promise<void> {
    const pluginPath = path.join(this.pluginsPath, pluginId);
    
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    console.log(`🧹 Cleaning plugin: ${pluginId}`);

    const filesToRemove = ['main.js', 'main.js.map'];
    let removedCount = 0;

    filesToRemove.forEach(fileName => {
      const filePath = path.join(pluginPath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   Removed: ${fileName}`);
        removedCount++;
      }
    });

    console.log(`✅ Cleaned ${removedCount} file(s)`);
  }

  async watchPlugin(pluginId: string): Promise<void> {
    const pluginPath = path.join(this.pluginsPath, pluginId);
    
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    console.log(`👀 Watching plugin: ${pluginId}`);
    console.log('Press Ctrl+C to stop');

    try {
      execSync('npm run dev', { cwd: pluginPath, stdio: 'inherit' });
    } catch (error) {
      // This is expected when the user presses Ctrl+C
      console.log('\n👋 Stopped watching');
    }
  }

  listPlugins(): void {
    console.log('📂 Available plugins:');
    
    if (!fs.existsSync(this.pluginsPath)) {
      console.log('   No plugins directory found');
      return;
    }

    const plugins = fs.readdirSync(this.pluginsPath).filter(item => {
      const itemPath = path.join(this.pluginsPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    if (plugins.length === 0) {
      console.log('   No plugins found');
      return;
    }

    plugins.forEach(plugin => {
      const manifestPath = path.join(this.pluginsPath, plugin, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        console.log(`   - ${plugin}: ${manifest.name} (v${manifest.version})`);
      } else {
        console.log(`   - ${plugin}: No manifest found`);
      }
    });
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const pluginId = args[1];

  const builder = new PluginBuilder();

  try {
    switch (command) {
      case 'build':
        if (pluginId) {
          await builder.buildPlugin(pluginId);
        } else {
          await builder.buildAllPlugins();
        }
        break;

      case 'clean':
        if (!pluginId) {
          console.log('Usage: npm run build-plugin clean <plugin-id>');
          process.exit(1);
        }
        await builder.cleanPlugin(pluginId);
        break;

      case 'watch':
        if (!pluginId) {
          console.log('Usage: npm run build-plugin watch <plugin-id>');
          process.exit(1);
        }
        await builder.watchPlugin(pluginId);
        break;

      case 'list':
        builder.listPlugins();
        break;

      default:
        console.log('Usage: npm run build-plugin <command> [plugin-id]');
        console.log('Commands:');
        console.log('  build [plugin-id]  - Build specific plugin or all plugins');
        console.log('  clean <plugin-id>  - Clean build artifacts');
        console.log('  watch <plugin-id>  - Watch and rebuild on changes');
        console.log('  list              - List all plugins');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}