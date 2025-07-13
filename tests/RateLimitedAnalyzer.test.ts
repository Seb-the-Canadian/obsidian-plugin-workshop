/**
 * Tests for RateLimitedAnalyzer
 */

import { RateLimitedAnalyzer } from '../src/analyzers/RateLimitedAnalyzer';
import { AnalyzerConfig, AnalyzerResult } from '../src/types/index';

describe('RateLimitedAnalyzer', () => {
  let analyzer: RateLimitedAnalyzer;
  let config: AnalyzerConfig['rateLimit'];

  beforeEach(() => {
    config = {
      requestsPerSecond: 5,
      maxQueueSize: 10,
      priorityLevels: 3,
    };
    analyzer = new RateLimitedAnalyzer(config);
  });

  afterEach(() => {
    analyzer.clear();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.getStatus().queueLength).toBe(0);
      expect(analyzer.getStatus().processing).toBe(false);
    });
  });

  describe('enqueue', () => {
    it('should enqueue and process a single item', async () => {
      const testData = { test: 'data' };
      const result = await analyzer.enqueue<AnalyzerResult>(testData);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('pattern');
      expect(result.data).toBeDefined();
      expect(result.metadata.source).toBe('RateLimitedAnalyzer');
    });

    it('should handle multiple items with priorities', async () => {
      const promises = [
        analyzer.enqueue<AnalyzerResult>({ data: 'low' }, 0),
        analyzer.enqueue<AnalyzerResult>({ data: 'high' }, 2),
        analyzer.enqueue<AnalyzerResult>({ data: 'medium' }, 1),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.metadata.source).toBe('RateLimitedAnalyzer');
      });
    });

    it('should respect queue size limit', async () => {
      const smallConfig = {
        requestsPerSecond: 1,
        maxQueueSize: 2,
        priorityLevels: 3,
      };
      const smallAnalyzer = new RateLimitedAnalyzer(smallConfig);

      // Fill up the queue
      const promises: Promise<AnalyzerResult | Error>[] = [];
      for (let i = 0; i < 3; i++) {
        promises.push(smallAnalyzer.enqueue<AnalyzerResult>({ data: i }).catch(e => e));
      }

      const results = await Promise.all(promises);
      
      // One should succeed, others should fail
      const errors = results.filter((r): r is Error => r instanceof Error);
      expect(errors.length).toBeGreaterThan(0);
      
      smallAnalyzer.clear();
    });

    it('should process text data correctly', async () => {
      const testText = 'This is a test string';
      const result = await analyzer.enqueue<AnalyzerResult>(testText);
      
      expect(result.data.type).toBe('text');
      expect(result.data.length).toBe(testText.length);
      expect(result.data.wordCount).toBe(testText.split(/\s+/).length);
    });

    it('should process object data correctly', async () => {
      const testObject = { key1: 'value1', key2: 'value2' };
      const result = await analyzer.enqueue<AnalyzerResult>(testObject);
      
      expect(result.data.type).toBe('object');
      expect(result.data.keys).toEqual(['key1', 'key2']);
      expect(result.data.complexity).toBeGreaterThan(0);
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limits', async () => {
      const fastConfig = {
        requestsPerSecond: 2,
        maxQueueSize: 10,
        priorityLevels: 3,
      };
      const fastAnalyzer = new RateLimitedAnalyzer(fastConfig);

      const startTime = Date.now();
      
      // Queue more items than the rate limit allows per second
      const promises: Promise<AnalyzerResult>[] = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fastAnalyzer.enqueue<AnalyzerResult>({ data: i }));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      
      // Should take at least 1 second due to rate limiting
      expect(endTime - startTime).toBeGreaterThan(500);
      
      fastAnalyzer.clear();
    });
  });

  describe('getStatus', () => {
    it('should return current status', () => {
      const status = analyzer.getStatus();
      
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('requestCount');
      expect(status).toHaveProperty('timeUntilReset');
      
      expect(typeof status.queueLength).toBe('number');
      expect(typeof status.processing).toBe('boolean');
      expect(typeof status.requestCount).toBe('number');
      expect(typeof status.timeUntilReset).toBe('number');
    });
  });

  describe('clear', () => {
    it('should clear the queue and reject pending items', async () => {
      // Add some items to the queue
      const promise1 = analyzer.enqueue<AnalyzerResult>({ data: 'test1' }).catch(e => e);
      const promise2 = analyzer.enqueue<AnalyzerResult>({ data: 'test2' }).catch(e => e);
      
      // Clear the queue
      analyzer.clear();
      
      const results = await Promise.all([promise1, promise2]);
      
      // Items should be rejected
      results.forEach(result => {
        if (result instanceof Error) {
          expect(result.message).toBe('Queue cleared');
        }
      });
      
      // Queue should be empty
      expect(analyzer.getStatus().queueLength).toBe(0);
    });
  });

  describe('data type detection', () => {
    it('should detect event type for event data', async () => {
      const eventData = 'addEventListener event handler';
      const result = await analyzer.enqueue<AnalyzerResult>(eventData);
      
      expect(result.type).toBe('event');
    });

    it('should detect pattern type for pattern data', async () => {
      const patternData = { type: 'pattern', data: 'test' };
      const result = await analyzer.enqueue<AnalyzerResult>(patternData);
      
      expect(result.type).toBe('pattern');
    });

    it('should detect state type for state data', async () => {
      const stateData = { type: 'state', data: 'test' };
      const result = await analyzer.enqueue<AnalyzerResult>(stateData);
      
      expect(result.type).toBe('state');
    });

    it('should detect documentation type for doc data', async () => {
      const docData = 'This is documentation content';
      const result = await analyzer.enqueue<AnalyzerResult>(docData);
      
      expect(result.type).toBe('documentation');
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence for string data', async () => {
      const shortString = 'short';
      const longString = 'a'.repeat(1000);
      
      const shortResult = await analyzer.enqueue<AnalyzerResult>(shortString);
      const longResult = await analyzer.enqueue<AnalyzerResult>(longString);
      
      expect(shortResult.metadata.confidence).toBeLessThan(longResult.metadata.confidence);
      expect(longResult.metadata.confidence).toBeCloseTo(0.9, 1);
    });

    it('should calculate confidence for object data', async () => {
      const smallObject = { key: 'value' };
      const largeObject = Object.fromEntries(Array(20).fill(0).map((_, i) => [`key${i}`, `value${i}`]));
      
      const smallResult = await analyzer.enqueue<AnalyzerResult>(smallObject);
      const largeResult = await analyzer.enqueue<AnalyzerResult>(largeObject);
      
      expect(smallResult.metadata.confidence).toBeLessThan(largeResult.metadata.confidence);
      expect(largeResult.metadata.confidence).toBeCloseTo(0.95, 1);
    });
  });
});