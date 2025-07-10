# 🎯 AI Collaboration Examples

## 1. Feature Implementation Examples

### ❌ Suboptimal Query
```markdown
"I want to add a new feature to my Obsidian plugin that does something with notes and maybe has some settings and works with the UI somehow."
```

### ✅ Optimized Query
```markdown
"Implement a note tagging feature with the following specifications:
- Add tag management UI to plugin settings
- Create command to add/remove tags from active note
- Store tags in YAML frontmatter
- Update UI when tags change

Current files:
- main.ts: Plugin core
- settings.ts: Settings management
- ui.ts: UI components

Next step: Implement tag management in settings"
```

## 2. Code Review Examples

### ❌ Suboptimal Query
```markdown
"Can you review my code and tell me if there are any issues?"
```

### ✅ Optimized Query
```markdown
"Review the error handling implementation in error-handler.ts:
- Focus on type safety and error recovery
- Check alignment with our error handling patterns
- Verify error logging meets our standards
- Ensure user feedback is appropriate

Changes made:
- Added custom error types
- Implemented error recovery strategies
- Enhanced error logging
- Added user notifications"
```

## 3. Debugging Examples

### ❌ Suboptimal Query
```markdown
"My plugin isn't working, can you help fix it?"
```

### ✅ Optimized Query
```markdown
"Debug settings persistence issue:
- Settings reset after plugin reload
- Expected: Settings persist between sessions
- Current implementation uses loadData/saveData
- Error occurs in settings.ts:125
- Already verified data format

Relevant code:
```typescript
async loadSettings() {
  const data = await this.loadData();
  this.settings = { ...DEFAULT_SETTINGS, ...data };
}
```"
```

## 4. State Management Examples

### ❌ Suboptimal State Tracking
```markdown
"Let's continue working on the plugin."
```

### ✅ Optimized State Tracking
```markdown
"Current development state:
Feature: Tag Management
Progress:
- ✓ Settings UI structure
- ✓ Tag storage implementation
- ⚡ Tag application to notes (in progress)
- ⏳ UI updates for tag changes
- ⏳ Command palette integration

Current task: Implementing tag application to active note
Files modified:
- tag-manager.ts
- main.ts

Next steps:
1. Complete tag application logic
2. Add event listeners for note changes
3. Implement UI update mechanism"
```

## 5. Context Management Examples

### ❌ Suboptimal Context
```markdown
"I have some TypeScript code that needs to handle errors better."
```

### ✅ Optimized Context
```markdown
"Enhance error handling in tag-manager.ts:
Current implementation:
```typescript
class TagManager {
  async addTag(tag: string) {
    const file = this.app.workspace.getActiveFile();
    const metadata = await this.app.metadataCache.getFileCache(file);
    // Basic error handling
    if (!file || !metadata) {
      console.error('No active file');
      return;
    }
  }
}
```

Requirements:
1. Handle missing file gracefully
2. Validate tag format
3. Manage duplicate tags
4. Provide user feedback
5. Log errors for debugging"
```

## 6. Validation Examples

### ❌ Suboptimal Validation
```markdown
"Does this look good?"
```

### ✅ Optimized Validation
```markdown
"Validate tag management implementation against requirements:

Code quality:
- [ ] Type safety for all operations
- [ ] Error handling for edge cases
- [ ] Performance impact assessment
- [ ] Memory usage optimization

Functionality:
- [ ] Tags persist correctly
- [ ] UI updates immediately
- [ ] Error feedback is clear
- [ ] Command palette integration works

Testing:
- [ ] Unit tests for core functions
- [ ] Integration tests for UI
- [ ] Error case coverage
- [ ] Performance benchmarks"
```

## 7. Documentation Examples

### ❌ Suboptimal Documentation
```markdown
"Add some comments to explain what the code does."
```

### ✅ Optimized Documentation
```markdown
"Document tag management implementation:

1. Architecture overview:
- Tag storage strategy
- Event handling system
- UI update mechanism

2. Key components:
```typescript
/**
 * Manages tag operations for notes
 * @implements {TagOperations}
 */
class TagManager {
  /**
   * Adds a tag to the active note
   * @param {string} tag - Tag to add
   * @throws {NoActiveFileError} When no file is active
   * @throws {InvalidTagError} When tag format is invalid
   * @returns {Promise<void>}
   */
  async addTag(tag: string): Promise<void>
}
```

3. Usage examples:
- Adding tags
- Removing tags
- Handling errors
- UI interactions"
```

## 8. Progress Tracking Examples

### ❌ Suboptimal Tracking
```markdown
"I think we're almost done."
```

### ✅ Optimized Tracking
```markdown
"Tag Management Feature Status:

Implementation (80%):
- ✓ Core tag operations
- ✓ Settings management
- ✓ Basic UI components
- ⚡ Event handling (in progress)
- ⏳ Command palette integration

Testing (60%):
- ✓ Unit tests for core operations
- ✓ Integration tests for settings
- ⚡ UI component testing
- ⏳ Error scenario testing

Documentation (40%):
- ✓ API documentation
- ⚡ Usage examples
- ⏳ Troubleshooting guide

Next milestone: Complete event handling system"
```

## 9. Resource Optimization Examples

### ❌ Suboptimal Resource Usage
```markdown
"Here's the entire codebase, can you review everything?"
```

### ✅ Optimized Resource Usage
```markdown
"Review tag event handling implementation:

Focus: event-handler.ts (lines 50-120)
Specific concerns:
1. Event debouncing
2. Memory leaks
3. Performance impact

Context:
- Handles tag updates
- Manages UI refresh
- Coordinates with metadata cache

Changed components:
```typescript
class TagEventHandler {
  private debounceTimeout: number;
  
  constructor() {
    this.setupEventListeners();
  }
  
  private handleTagUpdate() {
    // Implementation here
  }
}
```"
```

## 10. Iteration Examples

### ❌ Suboptimal Iteration
```markdown
"Let's keep working on making it better."
```

### ✅ Optimized Iteration
```markdown
"Optimize tag management performance:

Current metrics:
- Tag application: 150ms
- UI update: 80ms
- Memory usage: 25MB

Target improvements:
1. Reduce tag application to <100ms
2. UI updates under 50ms
3. Memory usage under 20MB

Proposed changes:
1. Implement tag caching
2. Optimize UI refresh logic
3. Improve memory management

Next steps:
1. Profile current implementation
2. Implement caching system
3. Measure improvements
4. Document optimizations"
```

## Best Practice Summary

1. **Query Construction**
   - Be specific and focused
   - Provide relevant context
   - Define clear objectives
   - Include validation criteria

2. **State Management**
   - Track progress explicitly
   - Document current state
   - List pending tasks
   - Define next steps

3. **Resource Optimization**
   - Focus on specific components
   - Provide minimal context
   - Clear objectives
   - Measurable outcomes

4. **Validation Process**
   - Define success criteria
   - List specific checks
   - Include test cases
   - Document results

5. **Documentation**
   - Clear structure
   - Code examples
   - Usage patterns
   - Error scenarios

Last Updated: 2025-07-09 