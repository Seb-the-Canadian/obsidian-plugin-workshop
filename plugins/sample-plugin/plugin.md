# 🔌 Sample Plugin

This plugin serves as a template demonstrating core Obsidian plugin features and best practices.

## 🎯 Purpose
- Demonstrate plugin lifecycle management
- Show proper TypeScript usage
- Illustrate settings handling
- Provide command registration examples

## 🌱 Features
- Registers a sample command in Command Palette
- Implements settings storage and retrieval
- Demonstrates proper cleanup on unload
- Shows TypeScript best practices

## 🧩 API Concepts Demonstrated
- Plugin lifecycle (`onload`/`onunload`)
- Command registration
- Settings management
- Type safety
- Error handling

## 🔧 Technical Implementation
```typescript
interface PluginSettings {
  setting1: string;
}

class MyPlugin extends Plugin {
  settings: PluginSettings;
  
  async onload() {
    await this.loadSettings();
    this.addCommand({...});
  }
}
```

## 📚 Development Notes
- Built with TypeScript
- Uses `esbuild` for bundling
- Includes Jest for testing
- Follows Obsidian API conventions

## 🔗 Related Documentation
- [Obsidian Plugin API](https://publish.obsidian.md/api/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 🧪 Testing
- Run `npm test` for unit tests
- Manual testing in vault-sandbox
- Check console for debug output

## 📋 Requirements
- Obsidian v1.0.0+
- Node.js 14+
- TypeScript 4.4+

Last Updated: 2025-07-09 