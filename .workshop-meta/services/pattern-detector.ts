interface PatternMatch {
  type: string;
  name: string;
  description: string;
  context: string;
  benefits: string[];
  implementation: string;
  examples: string[];
  frequency: number;
}

interface PatternRule {
  type: string;
  pattern: RegExp;
  description: string;
  benefits: string[];
}

export class PatternDetector {
  private rules: PatternRule[] = [
    // Event Handling Patterns
    {
      type: 'event_handler',
      pattern: /this\.registerEvent\(\s*this\.app\.(?:vault|workspace|metadataCache)\.(on|off)\(\s*['"]([^'"]+)['"]/g,
      description: 'Event registration pattern for Obsidian events',
      benefits: ['Event-driven architecture', 'Clean event handling', 'Proper cleanup']
    },
    {
      type: 'event_handler',
      pattern: /this\.registerDomEvent\(\s*(?:document|window|element)\s*,\s*['"]([^'"]+)['"]/g,
      description: 'DOM event registration pattern',
      benefits: ['Browser event handling', 'UI responsiveness', 'Event cleanup']
    },

    // State Management Patterns
    {
      type: 'state_management',
      pattern: /class\s+(\w+)Settings\s*{[^}]*}/g,
      description: 'Plugin settings state management',
      benefits: ['Persistent state', 'User configuration', 'Settings management']
    },
    {
      type: 'state_management',
      pattern: /async\s+loadSettings\(\)\s*{[^}]*}/g,
      description: 'Settings loading pattern',
      benefits: ['State initialization', 'Data persistence', 'Error handling']
    },
    {
      type: 'state_management',
      pattern: /async\s+saveSettings\(\)\s*{[^}]*}/g,
      description: 'Settings saving pattern',
      benefits: ['State persistence', 'Data integrity', 'Error handling']
    },

    // Lifecycle Hooks
    {
      type: 'lifecycle_hook',
      pattern: /async\s+onload\(\)\s*{[^}]*}/g,
      description: 'Plugin initialization lifecycle hook',
      benefits: ['Proper initialization', 'Resource setup', 'Feature registration']
    },
    {
      type: 'lifecycle_hook',
      pattern: /async\s+onunload\(\)\s*{[^}]*}/g,
      description: 'Plugin cleanup lifecycle hook',
      benefits: ['Resource cleanup', 'Memory management', 'Event unregistration']
    },

    // UI Components
    {
      type: 'ui_component',
      pattern: /extends\s+Modal\s*{[^}]*}/g,
      description: 'Modal UI component pattern',
      benefits: ['User interaction', 'Focused interface', 'Reusable component']
    },
    {
      type: 'ui_component',
      pattern: /extends\s+Setting\s*{[^}]*}/g,
      description: 'Settings UI component pattern',
      benefits: ['User configuration', 'Settings interface', 'Consistent UI']
    },
    {
      type: 'ui_component',
      pattern: /addCommand\(\s*{[^}]*}/g,
      description: 'Command registration pattern',
      benefits: ['User interaction', 'Feature accessibility', 'Command palette integration']
    }
  ];

  public detectPatterns(content: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const rule of this.rules) {
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        matches.push({
          type: rule.type,
          name: `${rule.type}: ${match[1] || match[0].slice(0, 30)}...`,
          description: rule.description,
          context: this.extractContext(content, match.index),
          benefits: rule.benefits,
          implementation: match[0],
          examples: [match[0]],
          frequency: 1
        });
      }
    }

    return this.deduplicateMatches(matches);
  }

  private extractContext(content: string, matchIndex: number): string {
    const contextStart = Math.max(0, matchIndex - 100);
    const contextEnd = Math.min(content.length, matchIndex + 100);
    return content.slice(contextStart, contextEnd);
  }

  private deduplicateMatches(matches: PatternMatch[]): PatternMatch[] {
    const uniqueMatches = new Map<string, PatternMatch>();

    for (const match of matches) {
      const key = `${match.type}:${match.name}`;
      const existing = uniqueMatches.get(key);

      if (existing) {
        existing.frequency += match.frequency;
        existing.examples.push(...match.examples);
      } else {
        uniqueMatches.set(key, match);
      }
    }

    return Array.from(uniqueMatches.values());
  }
} 