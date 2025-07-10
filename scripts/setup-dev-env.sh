#!/bin/bash

# Setup Development Environment Script
# This script sets up the development environment for Obsidian plugin development

echo "🔧 Setting up Obsidian Plugin Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to setup a plugin directory
setup_plugin_dir() {
    local plugin_dir=$1
    echo "📦 Setting up $plugin_dir..."
    
    # Navigate to plugin directory
    cd "$plugin_dir" || exit 1
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    npm install
    
    # Create necessary directories if they don't exist
    mkdir -p src/__tests__ __mocks__
    
    # Build the plugin
    echo "🔨 Building plugin..."
    npm run build
    
    # Run tests
    echo "🧪 Running tests..."
    npm test
    
    echo "✅ Setup complete for $plugin_dir"
    cd - > /dev/null
}

# Main setup process
echo "🔍 Looking for plugin directories..."

# Setup sample plugin
if [ -d "plugins/sample-plugin" ]; then
    setup_plugin_dir "plugins/sample-plugin"
fi

# Look for other plugin directories
for plugin_dir in plugins/*/; do
    if [ "$plugin_dir" != "plugins/sample-plugin/" ]; then
        if [ -f "${plugin_dir}package.json" ]; then
            setup_plugin_dir "$plugin_dir"
        fi
    fi
done

echo "
✨ Development environment setup complete!

Next steps:
1. Navigate to a plugin directory: cd plugins/sample-plugin
2. Start development: npm run dev
3. Run tests: npm test
4. Build for production: npm run build

For more information, check the documentation in .workshop-meta/
" 