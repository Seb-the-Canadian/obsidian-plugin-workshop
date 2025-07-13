/**
 * Core type definitions for Obsidian Plugin Workshop
 */

export interface AnalyzerConfig {
  rateLimit: {
    requestsPerSecond: number;
    maxQueueSize: number;
    priorityLevels: number;
  };
  patterns: {
    enabled: boolean;
    categories: string[];
    threshold: number;
  };
  stateAnalysis: {
    enabled: boolean;
    trackGlobalState: boolean;
    trackLocalState: boolean;
    performanceMetrics: boolean;
  };
}

export interface AnalyzerResult {
  id: string;
  type: 'pattern' | 'state' | 'event' | 'documentation';
  timestamp: number;
  data: any;
  metadata: {
    source: string;
    confidence: number;
    category: string;
  };
}

export interface QueueItem {
  id: string;
  priority: number;
  timestamp: number;
  data: any;
  callback: (result: any) => void;
  errorCallback: (error: Error) => void;
}

export interface PatternDetectionResult {
  pattern: string;
  category: 'event' | 'state' | 'lifecycle' | 'api' | 'ui';
  confidence: number;
  occurrences: number;
  locations: Array<{
    file: string;
    line: number;
    column: number;
  }>;
  suggestions: string[];
}

export interface StateAnalysisResult {
  type: 'global' | 'local' | 'component';
  variable: string;
  accessPattern: 'read' | 'write' | 'readwrite';
  frequency: number;
  locations: Array<{
    file: string;
    line: number;
    context: string;
  }>;
  optimizations: string[];
}

export interface EventPatternResult {
  eventType: string;
  handler: string;
  frequency: number;
  performance: {
    averageExecutionTime: number;
    maxExecutionTime: number;
    totalExecutions: number;
  };
  issues: Array<{
    type: 'memory-leak' | 'performance' | 'best-practice';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface PluginTemplate {
  name: string;
  description: string;
  version: string;
  author: string;
  files: Array<{
    path: string;
    content: string;
    type: 'typescript' | 'json' | 'markdown' | 'css';
  }>;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
}

export interface WorkshopConfig {
  analyzer: AnalyzerConfig;
  development: {
    hotReload: boolean;
    sourceMap: boolean;
    typeChecking: boolean;
  };
  testing: {
    framework: 'jest' | 'mocha' | 'vitest';
    coverage: boolean;
    threshold: number;
  };
  build: {
    minify: boolean;
    target: string;
    outputDir: string;
  };
}