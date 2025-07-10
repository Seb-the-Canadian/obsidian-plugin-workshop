# Claude + Cursor Plugin Workshop Guidelines

## 🧾 Purpose
This document defines usage rules, context scopes, and formatting expectations for AI development agents working within this plugin development environment.

## ✅ Core Rules
- Respond only with markdown, TypeScript, or JSON unless explicitly instructed otherwise
- Avoid speculative features unless specifically requested
- Follow Obsidian plugin API conventions and project `manifest.json` requirements
- Use `TODO.md` as your scope boundary for each plugin
- Provide only edits to requested files—no repo-wide changes unless explicitly scoped

## 🎯 Development Focus
- Maintain single responsibility principle in plugin design
- Document all assumptions and dependencies
- Include type definitions for all interfaces
- Follow TypeScript best practices
- Implement proper error handling and logging

## 📎 Context Anchors
- Plugin source: `plugins/<plugin-name>/src/`
- Design specification: `plugin.md`
- Task tracking: `TODO.md`
- Development reflections: `reflections.md`

## 🔄 Workflow Guidelines
1. Always check existing TODOs before starting new work
2. Document any API assumptions or version dependencies
3. Update plugin documentation alongside code changes
4. Add meaningful comments for complex logic
5. Follow semantic versioning for releases

## 🧪 Testing Requirements
- Include test cases for core functionality
- Document edge cases and error conditions
- Maintain test coverage for critical paths
- Include sandbox testing instructions

## 📚 Documentation Standards
- Maintain clear, concise code comments
- Update README.md with significant changes
- Document all public APIs and interfaces
- Include usage examples for complex features

## 🛠️ Tool Integration
- Respect existing development scripts
- Use provided utility functions
- Follow established type definitions
- Maintain consistent logging patterns

Last Updated: 2025-07-09 