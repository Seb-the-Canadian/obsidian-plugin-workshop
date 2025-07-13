# Basic Obsidian Plugin Template

This is a basic template for creating Obsidian plugins with TypeScript.

## Features

- 🎯 **Ribbon Icon**: Adds a clickable icon to the left ribbon
- 📊 **Status Bar**: Shows text in the bottom status bar
- 🔧 **Commands**: Includes both simple and complex commands
- ⚙️ **Settings**: Configurable settings tab
- 🎨 **Modal**: Example modal implementation
- 🔄 **Event Handling**: DOM event registration examples

## Quick Start

1. **Copy this template** to your plugin development directory
2. **Rename the plugin**:
   - Update `manifest.json` with your plugin details
   - Rename the main class `MyPlugin` to your plugin name
   - Update interface names and IDs
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the plugin**:
   ```bash
   npm run build
   ```

## Development

### Project Structure

```
basic-plugin/
├── main.ts          # Main plugin file
├── manifest.json    # Plugin manifest
├── tsconfig.json    # TypeScript configuration
├── README.md        # This file
└── package.json     # Dependencies (if needed)
```

### Building

To build the plugin:

```bash
npm run build
```

### Testing

To test your plugin:

1. Build the plugin
2. Copy the built files to your Obsidian plugins folder
3. Enable the plugin in Obsidian settings

## Customization

### Changing the Plugin Name

1. Update `manifest.json`:
   - Change `id` to your plugin's unique identifier
   - Change `name` to your plugin's display name
   - Update `description`, `author`, and `authorUrl`

2. Update `main.ts`:
   - Rename `MyPlugin` class to your plugin name
   - Rename `MyPluginSettings` interface
   - Update command IDs and names

### Adding New Features

- **Commands**: Add new commands in the `onload()` method
- **Settings**: Extend the `MyPluginSettings` interface and update the settings tab
- **UI Components**: Create new modals or views by extending Obsidian's base classes

## API Reference

This template demonstrates the following Obsidian API features:

- `Plugin` - Main plugin class
- `addRibbonIcon()` - Add ribbon icons
- `addStatusBarItem()` - Add status bar items
- `addCommand()` - Add commands with various callback types
- `addSettingTab()` - Add settings tabs
- `registerDomEvent()` - Register DOM events
- `registerInterval()` - Register intervals

## Resources

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Plugin Developer Guide](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Community Plugins](https://obsidian.md/plugins)

## License

This template is provided as-is for educational and development purposes.