#  Obsidian Plugin Workshop

## Project Overview
This workspace is structured for collaborative plugin development with AI partners like Claude Code or Cursor. It supports plugin ideation, scaffolding, testing, and publishing within a modular, markdown-native environment.

## Directory Structure
```
obsidian-plugin-workshop/
├── .workshop-meta/          # Project metadata and AI collaboration rules
├── shared/                  # Shared types and utilities
├── plugins/                 # Individual plugin projects
├── scripts/                 # Development automation scripts
├── vault-sandbox/          # Testing environment
└── docs/                   # Project documentation
```

## Getting Started
1. Use the plugin scaffolding script to create new plugins
2. Follow the AI partnership guidelines in `.workshop-meta/rules/`
3. Maintain isolated plugin development in separate folders
4. Test plugins in the vault sandbox environment

## Development Guidelines
- Each plugin maintains its own scope and documentation
- Follow Obsidian plugin API conventions
- Use TypeScript for all plugin development
- Maintain clear task tracking in `TODO.md` files

## Project Status: In Development
Current focus:
- Setting up initial development environment
- Establishing AI collaboration workflows
- Creating plugin templates and utilities

## Related Documentation
- [Obsidian Plugin API](https://publish.obsidian.md/api/)
- [Sample Plugin Reference](https://github.com/obsidianmd/obsidian-sample-plugin) 
