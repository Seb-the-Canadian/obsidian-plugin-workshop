/**
 * PatternDetector - Identifies and analyzes event handling patterns
 * 
 * Features:
 * - Event handler analysis
 * - Pattern categorization
 * - Issue detection
 * - Performance impact assessment
 */

import { PatternDetectionResult } from '../../types/index';

export class PatternDetector {
  private patterns: Map<string, PatternDetectionResult> = new Map();
  private readonly supportedPatterns = [
    'event-listener',
    'state-mutation',
    'lifecycle-hook',
    'api-call',
    'ui-update',
    'observer-pattern',
    'command-pattern',
    'singleton-pattern',
  ];

  /**
   * Analyze source code for patterns
   */
  public analyzeCode(code: string, filePath: string): PatternDetectionResult[] {
    const results: PatternDetectionResult[] = [];
    
    // Split code into lines for analysis
    const lines = code.split('\n');
    
    // Analyze each supported pattern
    for (const patternType of this.supportedPatterns) {
      const detection = this.detectPattern(patternType, lines, filePath);
      if (detection) {
        results.push(detection);
      }
    }

    return results;
  }

  /**
   * Detect a specific pattern in the code
   */
  private detectPattern(
    patternType: string,
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    switch (patternType) {
      case 'event-listener':
        return this.detectEventListenerPattern(lines, filePath);
      case 'state-mutation':
        return this.detectStateMutationPattern(lines, filePath);
      case 'lifecycle-hook':
        return this.detectLifecycleHookPattern(lines, filePath);
      case 'api-call':
        return this.detectApiCallPattern(lines, filePath);
      case 'ui-update':
        return this.detectUiUpdatePattern(lines, filePath);
      case 'observer-pattern':
        return this.detectObserverPattern(lines, filePath);
      case 'command-pattern':
        return this.detectCommandPattern(lines, filePath);
      case 'singleton-pattern':
        return this.detectSingletonPattern(lines, filePath);
      default:
        return null;
    }
  }

  /**
   * Detect event listener patterns
   */
  private detectEventListenerPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const eventPatterns = [
      /addEventListener\s*\(/g,
      /on\w+\s*=/g,
      /registerDomEvent\s*\(/g,
      /\.on\(['"][\w-]+['"],/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      eventPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'event-listener',
      category: 'event',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getEventListenerSuggestions(occurrences),
    };
  }

  /**
   * Detect state mutation patterns
   */
  private detectStateMutationPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const statePatterns = [
      /this\.[\w]+\s*=/g,
      /state\.\w+\s*=/g,
      /setState\s*\(/g,
      /\.update\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      statePatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'state-mutation',
      category: 'state',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getStateMutationSuggestions(occurrences),
    };
  }

  /**
   * Detect lifecycle hook patterns
   */
  private detectLifecycleHookPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const lifecyclePatterns = [
      /onload\s*\(/g,
      /onunload\s*\(/g,
      /onLayoutReady\s*\(/g,
      /onClose\s*\(/g,
      /onOpen\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      lifecyclePatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'lifecycle-hook',
      category: 'lifecycle',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getLifecycleSuggestions(occurrences),
    };
  }

  /**
   * Detect API call patterns
   */
  private detectApiCallPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const apiPatterns = [
      /fetch\s*\(/g,
      /axios\./g,
      /this\.app\.vault\./g,
      /this\.app\.metadataCache\./g,
      /\.request\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      apiPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'api-call',
      category: 'api',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getApiCallSuggestions(occurrences),
    };
  }

  /**
   * Detect UI update patterns
   */
  private detectUiUpdatePattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const uiPatterns = [
      /\.innerHTML\s*=/g,
      /\.textContent\s*=/g,
      /\.appendChild\s*\(/g,
      /\.createElement\s*\(/g,
      /\.createEl\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      uiPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'ui-update',
      category: 'ui',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getUiUpdateSuggestions(occurrences),
    };
  }

  /**
   * Detect observer pattern
   */
  private detectObserverPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const observerPatterns = [
      /\.observe\s*\(/g,
      /\.subscribe\s*\(/g,
      /\.notify\s*\(/g,
      /\.emit\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      observerPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'observer-pattern',
      category: 'event',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getObserverSuggestions(occurrences),
    };
  }

  /**
   * Detect command pattern
   */
  private detectCommandPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const commandPatterns = [
      /addCommand\s*\(/g,
      /\.execute\s*\(/g,
      /\.undo\s*\(/g,
      /\.redo\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      commandPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'command-pattern',
      category: 'api',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getCommandSuggestions(occurrences),
    };
  }

  /**
   * Detect singleton pattern
   */
  private detectSingletonPattern(
    lines: string[],
    filePath: string
  ): PatternDetectionResult | null {
    const singletonPatterns = [
      /static\s+instance\s*:/g,
      /getInstance\s*\(/g,
      /private\s+constructor\s*\(/g,
    ];

    const locations: Array<{ file: string; line: number; column: number }> = [];
    let occurrences = 0;

    lines.forEach((line, index) => {
      singletonPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          occurrences += matches.length;
          matches.forEach(match => {
            const column = line.indexOf(match);
            locations.push({
              file: filePath,
              line: index + 1,
              column: column + 1,
            });
          });
        }
      });
    });

    if (occurrences === 0) return null;

    return {
      pattern: 'singleton-pattern',
      category: 'lifecycle',
      confidence: this.calculateConfidence(occurrences, lines.length),
      occurrences,
      locations,
      suggestions: this.getSingletonSuggestions(occurrences),
    };
  }

  /**
   * Calculate confidence score based on occurrences and code length
   */
  private calculateConfidence(occurrences: number, totalLines: number): number {
    const density = occurrences / totalLines;
    return Math.min(0.95, Math.max(0.1, density * 10));
  }

  /**
   * Get suggestions for event listener patterns
   */
  private getEventListenerSuggestions(occurrences: number): string[] {
    const suggestions = [
      'Consider using Obsidian\'s registerDomEvent for proper cleanup',
      'Ensure event listeners are properly removed in onunload',
    ];

    if (occurrences > 5) {
      suggestions.push('Consider consolidating event handlers to reduce complexity');
    }

    return suggestions;
  }

  /**
   * Get suggestions for state mutation patterns
   */
  private getStateMutationSuggestions(occurrences: number): string[] {
    const suggestions = [
      'Consider using immutable state updates',
      'Implement proper state validation',
    ];

    if (occurrences > 10) {
      suggestions.push('Consider using a state management library');
    }

    return suggestions;
  }

  /**
   * Get suggestions for lifecycle patterns
   */
  private getLifecycleSuggestions(occurrences: number): string[] {
    return [
      'Ensure cleanup in onunload method',
      'Consider using async/await for lifecycle methods',
      'Implement proper error handling in lifecycle hooks',
    ];
  }

  /**
   * Get suggestions for API call patterns
   */
  private getApiCallSuggestions(occurrences: number): string[] {
    const suggestions = [
      'Implement proper error handling for API calls',
      'Consider using rate limiting for external APIs',
    ];

    if (occurrences > 5) {
      suggestions.push('Consider caching API responses');
    }

    return suggestions;
  }

  /**
   * Get suggestions for UI update patterns
   */
  private getUiUpdateSuggestions(occurrences: number): string[] {
    const suggestions = [
      'Use Obsidian\'s createEl for consistent styling',
      'Consider using DocumentFragment for multiple DOM updates',
    ];

    if (occurrences > 10) {
      suggestions.push('Consider virtual DOM or batching updates');
    }

    return suggestions;
  }

  /**
   * Get suggestions for observer patterns
   */
  private getObserverSuggestions(occurrences: number): string[] {
    return [
      'Ensure proper cleanup of observers',
      'Consider using weak references to prevent memory leaks',
      'Implement proper error handling in observer callbacks',
    ];
  }

  /**
   * Get suggestions for command patterns
   */
  private getCommandSuggestions(occurrences: number): string[] {
    return [
      'Implement proper command validation',
      'Consider adding keyboard shortcuts',
      'Add command descriptions for better UX',
    ];
  }

  /**
   * Get suggestions for singleton patterns
   */
  private getSingletonSuggestions(occurrences: number): string[] {
    return [
      'Consider if singleton is truly necessary',
      'Implement proper lazy initialization',
      'Consider dependency injection instead',
    ];
  }

  /**
   * Get all detected patterns
   */
  public getAllPatterns(): Map<string, PatternDetectionResult> {
    return new Map(this.patterns);
  }

  /**
   * Clear all detected patterns
   */
  public clearPatterns(): void {
    this.patterns.clear();
  }
}