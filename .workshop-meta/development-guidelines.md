# 📚 Obsidian Plugin Development Guidelines 2025

## 🎯 Core Development Principles

### Type Safety
- Use explicit types whenever inference isn't clear
- Enable `strictNullChecks` in tsconfig.json
- Prefer `unknown` over `any` for maximum type safety
- Leverage TypeScript 5.0+ features for better type definitions

### Code Organization
- Follow single responsibility principle
- Use modular architecture for better maintainability
- Implement clear separation of concerns
- Maintain consistent file naming conventions

### Performance
- Implement lazy loading for heavy features
- Use code splitting for better load times
- Optimize resource usage in event handlers
- Cache expensive computations

## 🛠️ Technical Requirements

### Development Environment
- Node.js 18+
- TypeScript 5.0+
- ESBuild/Rollup for bundling
- Jest for testing

### Project Structure
```
plugin-name/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── settings.ts       # Settings definitions
│   ├── ui/              # UI components
│   ├── utils/           # Utility functions
│   └── types/           # Type definitions
├── tests/
│   └── __tests__/       # Test files
├── manifest.json        # Plugin manifest
├── package.json         # Dependencies
└── tsconfig.json       # TypeScript config
```

## 🧪 Testing Standards

### Unit Testing
- Maintain 80%+ test coverage
- Test all public APIs
- Mock Obsidian API calls
- Use Jest snapshots for UI components

### Integration Testing
- Test plugin lifecycle events
- Verify settings persistence
- Check command registration
- Validate event handlers

## 📝 Code Style

### TypeScript Practices
```typescript
// Use interfaces for object types
interface PluginSettings {
  setting1: string;
  setting2: number;
}

// Leverage type inference when clear
const settings = {
  setting1: "default",
  setting2: 42
};

// Use type guards for runtime checks
function isValidSetting(value: unknown): value is PluginSettings {
  return typeof value === "object" && value !== null;
}
```

### Error Handling
- Use typed error classes
- Implement proper error boundaries
- Log errors appropriately
- Provide user-friendly error messages

## 🔒 Security Guidelines

### Data Safety
- Never store sensitive data in plain text
- Use secure storage methods
- Validate all user inputs
- Implement proper sanitization

### API Usage
- Follow Obsidian API best practices
- Handle API version changes gracefully
- Implement proper cleanup in onunload
- Use type-safe API wrappers

## 📚 Documentation Requirements

### Code Documentation
- Document all public APIs
- Use JSDoc comments
- Include usage examples
- Document type definitions

### User Documentation
- Provide clear installation instructions
- Include usage guidelines
- Document all features
- Maintain a changelog

## 🔄 Version Control

### Git Practices
- Use semantic versioning
- Write meaningful commit messages
- Follow conventional commits
- Maintain a clean git history

### Release Process
- Tag releases properly
- Update manifest.json version
- Generate release notes
- Test before publishing

## 🎨 UI/UX Guidelines

### Interface Design
- Follow Obsidian's design patterns
- Maintain consistent styling
- Support both light and dark themes
- Implement responsive layouts

### Accessibility
- Use ARIA labels where needed
- Ensure keyboard navigation
- Support screen readers
- Maintain proper contrast

## 🔧 Tooling Configuration

### ESLint Configuration
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 🤖 AI Integration Guidelines

### Code Generation
- Review AI-generated code thoroughly
- Maintain consistent style with AI outputs
- Document AI-assisted implementations
- Verify type safety of generated code

### Development Workflow
- Use AI for code review suggestions
- Leverage AI for documentation generation
- Implement AI-assisted testing
- Use AI for performance optimization

Last Updated: 2025-07-09 