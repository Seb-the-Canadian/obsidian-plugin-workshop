/**
 * StateAnalyzer - Track and optimize state usage patterns
 * 
 * Features:
 * - Global/local state detection
 * - Access pattern tracking
 * - Performance metrics
 * - Automated optimization suggestions
 */

import { StateAnalysisResult, AnalyzerConfig } from '../types/index';

export class StateAnalyzer {
  private stateAccesses: Map<string, StateAnalysisResult> = new Map();
  private readonly config: AnalyzerConfig['stateAnalysis'];

  constructor(config: AnalyzerConfig['stateAnalysis']) {
    this.config = config;
  }

  /**
   * Analyze state usage in source code
   */
  public analyzeCode(code: string, filePath: string): StateAnalysisResult[] {
    if (!this.config.enabled) {
      return [];
    }

    const results: StateAnalysisResult[] = [];
    const lines = code.split('\n');

    // Analyze global state if enabled
    if (this.config.trackGlobalState) {
      results.push(...this.analyzeGlobalState(lines, filePath));
    }

    // Analyze local state if enabled
    if (this.config.trackLocalState) {
      results.push(...this.analyzeLocalState(lines, filePath));
    }

    // Update internal tracking
    results.forEach(result => {
      this.stateAccesses.set(`${filePath}:${result.variable}`, result);
    });

    return results;
  }

  /**
   * Analyze global state patterns
   */
  private analyzeGlobalState(lines: string[], filePath: string): StateAnalysisResult[] {
    const results: StateAnalysisResult[] = [];
    const globalPatterns = [
      /window\.\w+/g,
      /global\.\w+/g,
      /this\.app\.\w+/g,
      /globalThis\.\w+/g,
    ];

    const stateVariables = new Map<string, {
      reads: number;
      writes: number;
      locations: Array<{ file: string; line: number; context: string }>;
    }>();

    lines.forEach((line, index) => {
      globalPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const variable = match.split('.')[1];
            if (!stateVariables.has(variable)) {
              stateVariables.set(variable, {
                reads: 0,
                writes: 0,
                locations: [],
              });
            }

            const state = stateVariables.get(variable)!;
            const isWrite = line.includes('=') && line.indexOf('=') > line.indexOf(match);
            
            if (isWrite) {
              state.writes++;
            } else {
              state.reads++;
            }

            state.locations.push({
              file: filePath,
              line: index + 1,
              context: line.trim(),
            });
          });
        }
      });
    });

    stateVariables.forEach((state, variable) => {
      const accessPattern = this.determineAccessPattern(state.reads, state.writes);
      const frequency = state.reads + state.writes;

      results.push({
        type: 'global',
        variable,
        accessPattern,
        frequency,
        locations: state.locations,
        optimizations: this.getGlobalStateOptimizations(state.reads, state.writes, frequency),
      });
    });

    return results;
  }

  /**
   * Analyze local state patterns
   */
  private analyzeLocalState(lines: string[], filePath: string): StateAnalysisResult[] {
    const results: StateAnalysisResult[] = [];
    const localPatterns = [
      /this\.\w+/g,
      /let\s+\w+/g,
      /const\s+\w+/g,
      /var\s+\w+/g,
    ];

    const stateVariables = new Map<string, {
      reads: number;
      writes: number;
      locations: Array<{ file: string; line: number; context: string }>;
      isThisProperty: boolean;
    }>();

    lines.forEach((line, index) => {
      localPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            let variable: string;
            let isThisProperty = false;

            if (match.startsWith('this.')) {
              variable = match.split('.')[1];
              isThisProperty = true;
            } else {
              variable = match.split(/\s+/)[1];
            }

            if (!stateVariables.has(variable)) {
              stateVariables.set(variable, {
                reads: 0,
                writes: 0,
                locations: [],
                isThisProperty,
              });
            }

            const state = stateVariables.get(variable)!;
            const isWrite = line.includes('=') && line.indexOf('=') > line.indexOf(match);
            
            if (isWrite) {
              state.writes++;
            } else {
              state.reads++;
            }

            state.locations.push({
              file: filePath,
              line: index + 1,
              context: line.trim(),
            });
          });
        }
      });
    });

    stateVariables.forEach((state, variable) => {
      const accessPattern = this.determineAccessPattern(state.reads, state.writes);
      const frequency = state.reads + state.writes;

      results.push({
        type: state.isThisProperty ? 'component' : 'local',
        variable,
        accessPattern,
        frequency,
        locations: state.locations,
        optimizations: this.getLocalStateOptimizations(
          state.reads,
          state.writes,
          frequency,
          state.isThisProperty
        ),
      });
    });

    return results;
  }

  /**
   * Determine access pattern based on read/write counts
   */
  private determineAccessPattern(reads: number, writes: number): 'read' | 'write' | 'readwrite' {
    if (reads > 0 && writes > 0) {
      return 'readwrite';
    } else if (writes > 0) {
      return 'write';
    } else {
      return 'read';
    }
  }

  /**
   * Get optimization suggestions for global state
   */
  private getGlobalStateOptimizations(
    reads: number,
    writes: number,
    frequency: number
  ): string[] {
    const optimizations: string[] = [];

    if (frequency > 20) {
      optimizations.push('Consider caching this global state value');
    }

    if (writes > reads) {
      optimizations.push('High write frequency detected - consider batching updates');
    }

    if (reads > 10 && writes === 0) {
      optimizations.push('Read-only global state - consider making it immutable');
    }

    if (writes > 0) {
      optimizations.push('Consider using a state management pattern (Redux, Zustand, etc.)');
    }

    return optimizations;
  }

  /**
   * Get optimization suggestions for local state
   */
  private getLocalStateOptimizations(
    reads: number,
    writes: number,
    frequency: number,
    isThisProperty: boolean
  ): string[] {
    const optimizations: string[] = [];

    if (frequency > 15) {
      optimizations.push('High frequency access detected - consider memoization');
    }

    if (isThisProperty && writes > 5) {
      optimizations.push('Consider using proper state management instead of direct property mutation');
    }

    if (reads > 10 && writes === 0) {
      optimizations.push('Read-only property - consider making it readonly');
    }

    if (writes > reads && isThisProperty) {
      optimizations.push('Consider using getter/setter methods for better encapsulation');
    }

    if (frequency > 25) {
      optimizations.push('Very high access frequency - consider performance optimization');
    }

    return optimizations;
  }

  /**
   * Get performance metrics for state usage
   */
  public getPerformanceMetrics(): {
    totalStateVariables: number;
    highFrequencyAccesses: number;
    readOnlyVariables: number;
    writeHeavyVariables: number;
    averageAccessFrequency: number;
  } {
    if (!this.config.performanceMetrics) {
      return {
        totalStateVariables: 0,
        highFrequencyAccesses: 0,
        readOnlyVariables: 0,
        writeHeavyVariables: 0,
        averageAccessFrequency: 0,
      };
    }

    const results = Array.from(this.stateAccesses.values());
    const totalStateVariables = results.length;
    const highFrequencyAccesses = results.filter(r => r.frequency > 15).length;
    const readOnlyVariables = results.filter(r => r.accessPattern === 'read').length;
    const writeHeavyVariables = results.filter(r => r.accessPattern === 'write').length;
    const averageAccessFrequency = results.reduce((sum, r) => sum + r.frequency, 0) / totalStateVariables;

    return {
      totalStateVariables,
      highFrequencyAccesses,
      readOnlyVariables,
      writeHeavyVariables,
      averageAccessFrequency: Math.round(averageAccessFrequency * 100) / 100,
    };
  }

  /**
   * Get state variables sorted by frequency
   */
  public getStateVariablesByFrequency(): StateAnalysisResult[] {
    return Array.from(this.stateAccesses.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get optimization suggestions for all state variables
   */
  public getAllOptimizations(): Array<{
    variable: string;
    type: StateAnalysisResult['type'];
    suggestions: string[];
  }> {
    return Array.from(this.stateAccesses.values()).map(result => ({
      variable: result.variable,
      type: result.type,
      suggestions: result.optimizations,
    }));
  }

  /**
   * Clear all state tracking data
   */
  public clearStateData(): void {
    this.stateAccesses.clear();
  }

  /**
   * Get state access summary
   */
  public getStateAccessSummary(): Map<string, StateAnalysisResult> {
    return new Map(this.stateAccesses);
  }
}