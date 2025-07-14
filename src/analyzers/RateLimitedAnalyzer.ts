/**
 * RateLimitedAnalyzer - Smart queue-based system for API interactions
 * 
 * Features:
 * - Queue-based request management
 * - Configurable rate limits
 * - Priority handling
 * - Error recovery
 */

import { AnalyzerConfig, AnalyzerResult, QueueItem } from '../types/index';

export class RateLimitedAnalyzer {
  private queue: QueueItem[] = [];
  private processing = false;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private pendingCount = 0;
  private readonly config: AnalyzerConfig['rateLimit'];

  constructor(config: AnalyzerConfig['rateLimit']) {
    this.config = config;
  }

  /**
   * Add an item to the processing queue
   */
  public async enqueue<T>(
    data: any,
    priority: number = 0,
    id?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Check total pending items (queue + currently processing)
      if (this.pendingCount >= this.config.maxQueueSize) {
        // Use setTimeout to make this asynchronous like the other rejections
        setTimeout(() => {
          reject(new Error('Queue is full. Cannot add more items.'));
        }, 0);
        return;
      }

      const item: QueueItem = {
        id: id || this.generateId(),
        priority: Math.max(0, Math.min(priority, this.config.priorityLevels - 1)),
        timestamp: Date.now(),
        data,
        callback: resolve,
        errorCallback: reject,
      };

      this.insertByPriority(item);
      this.pendingCount++;
      this.processQueue();
    });
  }

  /**
   * Process the queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        // Check if we need to reset the rate limit counter
        const now = Date.now();
        if (now - this.lastResetTime >= 1000) {
          this.requestCount = 0;
          this.lastResetTime = now;
        }

        // Wait if we've hit the rate limit
        if (this.requestCount >= this.config.requestsPerSecond) {
          const waitTime = 1000 - (now - this.lastResetTime);
          if (waitTime > 0) {
            await this.sleep(waitTime);
            continue;
          }
        }

        const item = this.queue.shift()!;
        this.requestCount++;

        try {
          const result = await this.analyzeItem(item);
          item.callback(result);
        } catch (error) {
          item.errorCallback(error as Error);
        } finally {
          this.pendingCount--;
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Analyze an individual item
   */
  private async analyzeItem(item: QueueItem): Promise<AnalyzerResult> {
    // Simulate processing time
    await this.sleep(100);

    const result: AnalyzerResult = {
      id: item.id,
      type: this.determineAnalysisType(item.data),
      timestamp: Date.now(),
      data: await this.performAnalysis(item.data),
      metadata: {
        source: 'RateLimitedAnalyzer',
        confidence: this.calculateConfidence(item.data),
        category: this.categorizeData(item.data),
      },
    };

    return result;
  }

  /**
   * Perform the actual analysis on the data
   */
  private async performAnalysis(data: any): Promise<any> {
    // This is where the actual analysis logic would go
    // For now, we'll return processed data based on the input type
    
    if (typeof data === 'string') {
      return {
        type: 'text',
        length: data.length,
        wordCount: data.split(/\s+/).length,
        analysis: 'Text analysis completed',
      };
    }

    if (typeof data === 'object' && data !== null) {
      return {
        type: 'object',
        keys: Object.keys(data),
        complexity: this.calculateComplexity(data),
        analysis: 'Object analysis completed',
      };
    }

    return {
      type: 'unknown',
      analysis: 'Basic analysis completed',
    };
  }

  /**
   * Insert item into queue maintaining priority order
   */
  private insertByPriority(item: QueueItem): void {
    let inserted = false;
    
    for (let i = 0; i < this.queue.length; i++) {
      if (item.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, item);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(item);
    }
  }

  /**
   * Generate a unique ID for queue items
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine the type of analysis based on data
   */
  private determineAnalysisType(data: any): AnalyzerResult['type'] {
    if (typeof data === 'string' && data.includes('event')) {
      return 'event';
    }
    if (typeof data === 'object' && data?.type === 'pattern') {
      return 'pattern';
    }
    if (typeof data === 'object' && data?.type === 'state') {
      return 'state';
    }
    if (typeof data === 'string' && data.includes('doc')) {
      return 'documentation';
    }
    return 'pattern'; // default
  }

  /**
   * Calculate confidence score for analysis
   */
  private calculateConfidence(data: any): number {
    if (typeof data === 'string') {
      return Math.min(0.9, data.length / 1000);
    }
    if (typeof data === 'object' && data !== null) {
      return Math.min(0.95, Object.keys(data).length / 20);
    }
    return 0.5;
  }

  /**
   * Categorize data for analysis
   */
  private categorizeData(data: any): string {
    if (typeof data === 'string') {
      return 'text';
    }
    if (Array.isArray(data)) {
      return 'array';
    }
    if (typeof data === 'object' && data !== null) {
      return 'object';
    }
    return 'primitive';
  }

  /**
   * Calculate complexity of object data
   */
  private calculateComplexity(data: any): number {
    if (typeof data !== 'object' || data === null) {
      return 0;
    }

    let complexity = 0;
    
    function traverse(obj: any, depth: number = 0): void {
      if (depth > 5) return; // Prevent infinite recursion
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          complexity++;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], depth + 1);
          }
        }
      }
    }

    traverse(data);
    return complexity;
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  public getStatus(): {
    queueLength: number;
    processing: boolean;
    requestCount: number;
    timeUntilReset: number;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      requestCount: this.requestCount,
      timeUntilReset: Math.max(0, 1000 - (Date.now() - this.lastResetTime)),
    };
  }

  /**
   * Clear the queue
   */
  public clear(): void {
    this.queue.forEach(item => {
      item.errorCallback(new Error('Queue cleared'));
    });
    this.queue = [];
    this.processing = false;
    this.pendingCount = 0;
  }
}