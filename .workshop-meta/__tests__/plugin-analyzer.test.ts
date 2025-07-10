import { PluginAnalyzer, AnalysisConfig } from '../plugin-analyzer';

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      repos: {
        getContent: jest.fn().mockResolvedValue({
          data: [
            {
              type: 'file',
              name: 'test.ts',
              path: 'test.ts',
              content: Buffer.from(`
                class TestPlugin {
                  constructor() {}
                  
                  async onload() {
                    try {
                      await this.loadSettings();
                    } catch (error) {
                      console.error('Failed to load settings:', error);
                    }
                  }
                }
              `).toString('base64')
            }
          ]
        })
      },
      issues: {
        listForRepo: jest.fn().mockResolvedValue({
          data: [
            {
              title: 'Test Issue',
              body: 'Test issue body',
              labels: [{ name: 'bug' }]
            }
          ]
        })
      },
      pulls: {
        list: jest.fn().mockResolvedValue({
          data: [
            {
              title: 'Test PR',
              body: 'Test PR body',
              number: 1
            }
          ]
        }),
        listFiles: jest.fn().mockResolvedValue({
          data: [
            {
              filename: 'test.ts',
              patch: 'Test patch'
            }
          ]
        })
      }
    }))
  };
});

describe('PluginAnalyzer', () => {
  const config: AnalysisConfig = {
    owner: 'test-owner',
    repo: 'test-repo'
  };

  let analyzer: PluginAnalyzer;

  beforeEach(() => {
    analyzer = new PluginAnalyzer('test-token', config);
  });

  describe('analyze', () => {
    it('should analyze repository and return results', async () => {
      const result = await analyzer.analyze();

      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('bestPractices');
      expect(result).toHaveProperty('metrics');
    });

    it('should extract class patterns', async () => {
      const result = await analyzer.analyze();
      const classPattern = result.patterns.find(p => p.name === 'Class: TestPlugin');

      expect(classPattern).toBeDefined();
      expect(classPattern?.context).toBe('Class Definition');
    });

    it('should extract error handling patterns', async () => {
      const result = await analyzer.analyze();
      const errorPattern = result.patterns.find(p => p.name === 'Error Handling');

      expect(errorPattern).toBeDefined();
      expect(errorPattern?.context).toBe('Error Management');
    });

    it('should extract issue patterns', async () => {
      const result = await analyzer.analyze();
      const issuePattern = result.patterns.find(p => p.name === 'Bug: Test Issue');

      expect(issuePattern).toBeDefined();
      expect(issuePattern?.context).toBe('Bug Pattern');
    });

    it('should extract PR patterns', async () => {
      const result = await analyzer.analyze();
      const prPattern = result.patterns.find(p => p.name === 'PR: Test PR');

      expect(prPattern).toBeDefined();
      expect(prPattern?.context).toBe('Code Change');
    });
  });

  describe('generateReport', () => {
    it('should generate a markdown report', async () => {
      const report = await analyzer.generateReport();

      expect(report).toContain('# Plugin Analysis Report');
      expect(report).toContain('## Overview');
      expect(report).toContain('## Patterns Found');
      expect(report).toContain('## Best Practices');
      expect(report).toContain('## Metrics');
    });
  });
});

// Test utilities
describe('Test Utilities', () => {
  describe('Pattern Extraction', () => {
    it('should extract class patterns correctly', async () => {
      const analyzer = new PluginAnalyzer('test-token', {
        owner: 'test-owner',
        repo: 'test-repo'
      });

      const result = await analyzer.analyze();
      const patterns = result.patterns;

      expect(patterns.some(p => p.name.startsWith('Class:'))).toBe(true);
    });

    it('should extract error handling patterns correctly', async () => {
      const analyzer = new PluginAnalyzer('test-token', {
        owner: 'test-owner',
        repo: 'test-repo'
      });

      const result = await analyzer.analyze();
      const patterns = result.patterns;

      expect(patterns.some(p => p.name === 'Error Handling')).toBe(true);
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate all metrics', async () => {
      const analyzer = new PluginAnalyzer('test-token', {
        owner: 'test-owner',
        repo: 'test-repo'
      });

      const result = await analyzer.analyze();
      const metrics = result.metrics;

      expect(metrics.codeQuality).toBeDefined();
      expect(metrics.testCoverage).toBeDefined();
      expect(metrics.documentation).toBeDefined();
      expect(metrics.performance).toBeDefined();
    });
  });
}); 