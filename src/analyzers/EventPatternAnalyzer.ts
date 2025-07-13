/**
 * EventPatternAnalyzer - Detect and analyze event handling patterns
 * 
 * Features:
 * - Event handler analysis
 * - Pattern categorization
 * - Issue detection
 * - Performance impact assessment
 */

import { EventPatternResult } from '../types/index';

export class EventPatternAnalyzer {
  private eventPatterns: Map<string, EventPatternResult> = new Map();
  private performanceData: Map<string, number[]> = new Map();

  /**
   * Analyze event patterns in source code
   */
  public analyzeCode(code: string, filePath: string): EventPatternResult[] {
    const results: EventPatternResult[] = [];
    const lines = code.split('\n');

    // Find all event handlers
    const eventHandlers = this.findEventHandlers(lines, filePath);
    
    // Analyze each handler
    eventHandlers.forEach(handler => {
      const analysis = this.analyzeEventHandler(handler, lines, filePath);
      if (analysis) {
        results.push(analysis);
        this.eventPatterns.set(`${filePath}:${handler.name}`, analysis);
      }
    });

    return results;
  }

  /**
   * Find event handlers in code
   */
  private findEventHandlers(lines: string[], filePath: string): Array<{
    name: string;
    type: string;
    line: number;
    pattern: string;
  }> {
    const handlers: Array<{
      name: string;
      type: string;
      line: number;
      pattern: string;
    }> = [];

    const eventPatterns = [
      {
        pattern: /addEventListener\s*\(\s*['"](\w+)['"],\s*(\w+)/g,
        type: 'addEventListener',
      },
      {
        pattern: /on(\w+)\s*[:=]\s*(\w+)/g,
        type: 'propertyAssignment',
      },
      {
        pattern: /registerDomEvent\s*\(\s*\w+,\s*['"](\w+)['"],\s*(\w+)/g,
        type: 'registerDomEvent',
      },
      {
        pattern: /\.on\s*\(\s*['"](\w+)['"],\s*(\w+)/g,
        type: 'eventEmitter',
      },
    ];

    lines.forEach((line, index) => {
      eventPatterns.forEach(({ pattern, type }) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        while ((match = regex.exec(line)) !== null) {
          handlers.push({
            name: match[2] || match[1],
            type: match[1] || type,
            line: index + 1,
            pattern: type,
          });
        }
      });
    });

    return handlers;
  }

  /**
   * Analyze an individual event handler
   */
  private analyzeEventHandler(
    handler: { name: string; type: string; line: number; pattern: string },
    lines: string[],
    filePath: string
  ): EventPatternResult | null {
    // Find the handler function
    const handlerFunction = this.findHandlerFunction(handler.name, lines);
    if (!handlerFunction) {
      return null;
    }

    // Analyze the handler
    const issues = this.detectIssues(handlerFunction, lines);
    const performance = this.analyzePerformance(handlerFunction, lines);

    return {
      eventType: handler.type,
      handler: handler.name,
      frequency: this.calculateFrequency(handler.name, lines),
      performance,
      issues,
    };
  }

  /**
   * Find the handler function definition
   */
  private findHandlerFunction(
    handlerName: string,
    lines: string[]
  ): { start: number; end: number; body: string[] } | null {
    const functionPatterns = [
      new RegExp(`function\\s+${handlerName}\\s*\\(`),
      new RegExp(`${handlerName}\\s*[:=]\\s*function`),
      new RegExp(`${handlerName}\\s*[:=]\\s*\\(`),
      new RegExp(`${handlerName}\\s*[:=]\\s*async\\s*\\(`),
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of functionPatterns) {
        if (pattern.test(line)) {
          const end = this.findFunctionEnd(i, lines);
          if (end !== -1) {
            return {
              start: i,
              end,
              body: lines.slice(i, end + 1),
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Find the end of a function
   */
  private findFunctionEnd(start: number, lines: string[]): number {
    let braceCount = 0;
    let foundOpenBrace = false;

    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpenBrace = true;
        } else if (char === '}') {
          braceCount--;
          if (foundOpenBrace && braceCount === 0) {
            return i;
          }
        }
      }
    }

    return -1;
  }

  /**
   * Detect issues in event handler
   */
  private detectIssues(
    handlerFunction: { start: number; end: number; body: string[] },
    lines: string[]
  ): Array<{
    type: 'memory-leak' | 'performance' | 'best-practice';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const issues: Array<{
      type: 'memory-leak' | 'performance' | 'best-practice';
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    const body = handlerFunction.body.join('\n');

    // Check for memory leaks
    if (body.includes('addEventListener') && !body.includes('removeEventListener')) {
      issues.push({
        type: 'memory-leak',
        description: 'Event listener added without corresponding removal',
        severity: 'high',
      });
    }

    if (body.includes('setInterval') && !body.includes('clearInterval')) {
      issues.push({
        type: 'memory-leak',
        description: 'setInterval used without clearInterval',
        severity: 'high',
      });
    }

    if (body.includes('setTimeout') && !body.includes('clearTimeout')) {
      issues.push({
        type: 'memory-leak',
        description: 'setTimeout used without proper cleanup',
        severity: 'medium',
      });
    }

    // Check for performance issues
    if (body.includes('document.querySelector') || body.includes('document.querySelectorAll')) {
      const queryCount = (body.match(/document\.querySelector/g) || []).length;
      if (queryCount > 3) {
        issues.push({
          type: 'performance',
          description: 'Multiple DOM queries detected - consider caching selectors',
          severity: 'medium',
        });
      }
    }

    if (body.includes('for') && body.includes('appendChild')) {
      issues.push({
        type: 'performance',
        description: 'DOM manipulation in loop detected - consider using DocumentFragment',
        severity: 'medium',
      });
    }

    // Check for best practices
    if (!body.includes('preventDefault') && !body.includes('stopPropagation')) {
      issues.push({
        type: 'best-practice',
        description: 'Consider using preventDefault() or stopPropagation() if needed',
        severity: 'low',
      });
    }

    if (body.includes('try') && !body.includes('catch')) {
      issues.push({
        type: 'best-practice',
        description: 'Try block without catch - consider error handling',
        severity: 'medium',
      });
    }

    return issues;
  }

  /**
   * Analyze performance characteristics
   */
  private analyzePerformance(
    handlerFunction: { start: number; end: number; body: string[] },
    lines: string[]
  ): {
    averageExecutionTime: number;
    maxExecutionTime: number;
    totalExecutions: number;
  } {
    const body = handlerFunction.body.join('\n');
    
    // Estimate execution time based on complexity
    let complexity = 0;
    
    // Count potentially expensive operations
    complexity += (body.match(/document\.querySelector/g) || []).length * 2;
    complexity += (body.match(/for\s*\(/g) || []).length * 3;
    complexity += (body.match(/while\s*\(/g) || []).length * 4;
    complexity += (body.match(/fetch\s*\(/g) || []).length * 10;
    complexity += (body.match(/await\s+/g) || []).length * 5;
    complexity += (body.match(/\.map\s*\(/g) || []).length * 2;
    complexity += (body.match(/\.filter\s*\(/g) || []).length * 2;
    complexity += (body.match(/\.reduce\s*\(/g) || []).length * 3;

    // Base execution time estimates (in milliseconds)
    const baseTime = 0.1;
    const complexityMultiplier = 0.5;
    
    const estimatedTime = baseTime + (complexity * complexityMultiplier);
    
    return {
      averageExecutionTime: Math.round(estimatedTime * 100) / 100,
      maxExecutionTime: Math.round(estimatedTime * 2 * 100) / 100,
      totalExecutions: 1, // This would need runtime tracking for accurate values
    };
  }

  /**
   * Calculate frequency of event handler usage
   */
  private calculateFrequency(handlerName: string, lines: string[]): number {
    const code = lines.join('\n');
    const occurrences = (code.match(new RegExp(handlerName, 'g')) || []).length;
    return occurrences;
  }

  /**
   * Get all detected event patterns
   */
  public getAllEventPatterns(): Map<string, EventPatternResult> {
    return new Map(this.eventPatterns);
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    totalHandlers: number;
    averageComplexity: number;
    highRiskHandlers: number;
    memoryLeakRisk: number;
  } {
    const patterns = Array.from(this.eventPatterns.values());
    const totalHandlers = patterns.length;
    
    if (totalHandlers === 0) {
      return {
        totalHandlers: 0,
        averageComplexity: 0,
        highRiskHandlers: 0,
        memoryLeakRisk: 0,
      };
    }

    const averageComplexity = patterns.reduce((sum, p) => sum + p.performance.averageExecutionTime, 0) / totalHandlers;
    const highRiskHandlers = patterns.filter(p => p.performance.averageExecutionTime > 5).length;
    const memoryLeakRisk = patterns.filter(p => 
      p.issues.some(issue => issue.type === 'memory-leak' && issue.severity === 'high')
    ).length;

    return {
      totalHandlers,
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      highRiskHandlers,
      memoryLeakRisk,
    };
  }

  /**
   * Clear all event pattern data
   */
  public clearEventPatterns(): void {
    this.eventPatterns.clear();
    this.performanceData.clear();
  }
}